const express = require("express");
const { google } = require("googleapis");

const GmailToken = require("../models/GmailToken");
const Transaction = require("../models/Transaction");
const authMiddleware = require("../middleware/authMiddleware");
const { readEmails } = require("../utils/gmailScanner");
const { parseTransaction } = require("../utils/parser");

const router = express.Router();

/* ================= GOOGLE OAUTH CLIENT ================= */

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

/* =======================================================
   1️⃣ CONNECT GMAIL (PUBLIC – NO JWT)
   OAuth redirects MUST NOT require authMiddleware
======================================================= */

router.get("/connect", (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).send("Missing userId");
    }

    const authUrl = oauth2Client.generateAuthUrl({
      access_type: "offline",
      scope: ["https://www.googleapis.com/auth/gmail.readonly"],
      prompt: "consent",
      state: userId, // 🔗 link Gmail → user
    });

    res.redirect(authUrl);
  } catch (err) {
    console.error("❌ GMAIL CONNECT ERROR:", err);
    res.status(500).send("Failed to connect Gmail");
  }
});

/* =======================================================
   2️⃣ OAUTH CALLBACK (PUBLIC)
======================================================= */

router.get("/callback", async (req, res) => {
  try {
    const { code, state } = req.query;

    if (!code || !state) {
      return res.redirect(
        "http://localhost:5173/gmail-connect?error=missing_data"
      );
    }

    const userId = state;

    // Exchange code → tokens
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Fetch Gmail profile
    const gmail = google.gmail({ version: "v1", auth: oauth2Client });
    const profile = await gmail.users.getProfile({ userId: "me" });

    // Save or update tokens
    await GmailToken.findOneAndUpdate(
      { userId },
      {
        userId,
        email: profile.data.emailAddress,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expiry_date: tokens.expiry_date,
        scope: tokens.scope,
        token_type: tokens.token_type,
      },
      { upsert: true, new: true }
    );

    console.log("✅ Gmail connected for user:", userId);

    res.redirect("http://localhost:5173/gmail-connect?success=true");
  } catch (err) {
    console.error("❌ GMAIL CALLBACK ERROR:", err);
    res.redirect(
      "http://localhost:5173/gmail-connect?error=auth_failed"
    );
  }
});

/* =======================================================
   3️⃣ CHECK CONNECTION STATUS (JWT PROTECTED)
======================================================= */

router.get("/status", authMiddleware, async (req, res) => {
  try {
    const tokenDoc = await GmailToken.findOne({
      userId: req.user.userId,
    });

    res.json({
      connected: !!tokenDoc,
      email: tokenDoc?.email || null,
      connectedAt: tokenDoc?.updatedAt || null,
    });
  } catch (err) {
    console.error("❌ STATUS ERROR:", err);
    res.status(500).json({ error: "Failed to check status" });
  }
});

/* =======================================================
   4️⃣ DISCONNECT GMAIL (JWT PROTECTED)
======================================================= */

router.delete("/disconnect", authMiddleware, async (req, res) => {
  try {
    await GmailToken.deleteOne({ userId: req.user.userId });

    res.json({
      success: true,
      message: "Gmail disconnected",
    });
  } catch (err) {
    console.error("❌ DISCONNECT ERROR:", err);
    res.status(500).json({ error: "Failed to disconnect Gmail" });
  }
});

/* =======================================================
   5️⃣ SCAN + PARSE + SAVE (JWT PROTECTED)
======================================================= */

router.get("/scan-and-save", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;

    const tokenDoc = await GmailToken.findOne({ userId });
    if (!tokenDoc) {
      return res.status(404).json({ error: "Gmail not connected" });
    }

    oauth2Client.setCredentials({
      access_token: tokenDoc.access_token,
      refresh_token: tokenDoc.refresh_token,
    });

    const emails = await readEmails(oauth2Client);

    let saved = 0;
    let skipped = 0;

    for (const email of emails) {
      const parsed = parseTransaction(email.text);
      if (!parsed) {
        skipped++;
        continue;
      }

      const result = await Transaction.updateOne(
        { userId, emailId: email.id },
        {
          $setOnInsert: {
            userId,
            emailId: email.id,
            type: parsed.type,
            amount: parsed.amount,
            description: parsed.description,
            currency: parsed.currency || "INR",
            source: "GMAIL",
            transactionDate: parsed.transactionDate || new Date(),
          },
        },
        { upsert: true }
      );

      if (result.upsertedCount > 0) saved++;
      else skipped++;
    }

    res.json({
      success: true,
      totalEmails: emails.length,
      saved,
      skipped,
    });
  } catch (err) {
    console.error("❌ SCAN ERROR:", err);
    res.status(500).json({ error: "Scan failed" });
  }
});

module.exports = router;
