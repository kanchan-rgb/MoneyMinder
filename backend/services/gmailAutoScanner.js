const cron = require("node-cron");
const { google } = require("googleapis");

const GmailToken = require("../models/GmailToken");
const Transaction = require("../models/Transaction");
const { readEmails } = require("../utils/gmailScanner");
const { parseTransaction } = require("../utils/parser");

// 🔐 OAuth client (shared, creds set per user)
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

// ⏱️ RUN EVERY 1 MINUTE
const startGmailAutoScan = () => {
  console.log("🚀 Gmail Auto Scanner INITIALIZED");

  cron.schedule("* * * * *", async () => {
    console.log("🔄 Auto Gmail scan started:", new Date().toISOString());

    try {
      // 1️⃣ Get all connected Gmail accounts
      const allTokens = await GmailToken.find({ userId: { $ne: null } });

      console.log(`📊 Found ${allTokens.length} Gmail token(s)`);

      if (allTokens.length === 0) return;

      // 2️⃣ Process each user separately
      for (const tokenDoc of allTokens) {
        console.log("👤 Scanning Gmail for user:", tokenDoc.userId.toString());

        // 3️⃣ Set OAuth credentials
        oauth2Client.setCredentials({
          access_token: tokenDoc.access_token,
          refresh_token: tokenDoc.refresh_token,
        });

        // 4️⃣ Read emails
        const emails = await readEmails(oauth2Client);
        console.log(`📧 ${emails.length} email(s) fetched`);

        for (const email of emails) {
          console.log("📨 Processing email:", email.id);

          // 5️⃣ Parse email text
          const parsed = parseTransaction(email.text);

          if (!parsed) {
            console.log("⏭ Skipped (not a transaction):", email.id);
            continue;
          }

          // 6️⃣ Final transaction object
          const transactionData = {
            userId: tokenDoc.userId,
            emailId: email.id,
            type: parsed.type,
            amount: parsed.amount,
            description: parsed.description,
            currency: parsed.currency || "INR",
            source: "GMAIL",
            transactionDate: parsed.transactionDate, // ✅ FIXED
          };

          try {
            // 7️⃣ Insert (duplicate-safe via unique index)
            await Transaction.create(transactionData);
            console.log("✅ Transaction saved:", transactionData.amount);
          } catch (err) {
            if (err.code === 11000) {
              console.log("⚠️ Duplicate transaction skipped:", email.id);
            } else {
              console.error("❌ Failed to save transaction:", err.message);
            }
          }
        }
      }

      console.log("✅ Auto Gmail scan finished");
    } catch (err) {
      console.error("❌ AUTO SCAN ERROR:", err);
      console.error(err.stack);
    }
  });
};

module.exports = { startGmailAutoScan };
