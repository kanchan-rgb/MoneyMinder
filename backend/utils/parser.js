function normalizeText(text) {
  return text.replace(/\s+/g, " ").trim();
}

function parseTransaction(text) {
  if (!text) {
    console.log("⚠️ Empty text provided to parser");
    return null;
  }

  const normalized = normalizeText(text);
  const lower = normalized.toLowerCase();

  // ===============================
  // 1️⃣ TRANSACTION TYPE
  // ===============================
  let type = null;

  if (
    lower.includes("debit") ||
    lower.includes("debited") ||
    lower.includes("spent") ||
    lower.includes("paid") ||
    lower.includes("purchase")
  ) {
    type = "DEBIT";
  } else if (
    lower.includes("credit") ||
    lower.includes("credited") ||
    lower.includes("received")
  ) {
    type = "CREDIT";
  }

  if (!type) {
    console.log("⚠️ Could not determine transaction type:", normalized);
    return null;
  }

  // ===============================
  // 2️⃣ AMOUNT (₹50 / Rs.50 / INR 50)
  // ===============================
  let amount = null;
  let amountMatch =
    normalized.match(/₹\s?([\d,]+(\.\d{1,2})?)/) ||
    normalized.match(/(?:INR|Rs\.?)\s?([\d,]+(\.\d{1,2})?)/i) ||
    normalized.match(/(?:amount|total|sum|by)\s+₹?\s?([\d,]+(\.\d{1,2})?)/i);

  if (amountMatch) {
    amount = Number(amountMatch[1].replace(/,/g, ""));
  }

  if (!amount || amount <= 0) {
    console.log("⚠️ Could not parse valid amount:", normalized);
    return null;
  }

  // ===============================
  // 3️⃣ DATE (on 17 Sept)
  // ===============================
  let transactionDate = new Date();

  const dateMatch = normalized.match(
    /\b(\d{1,2})\s?(jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)\b/i
  );

  if (dateMatch) {
    const year = new Date().getFullYear();
    transactionDate = new Date(`${dateMatch[1]} ${dateMatch[2]} ${year}`);
  }

  // ===============================
  // 4️⃣ MERCHANT / DESCRIPTION
  // ===============================
  let description = "Unknown";

  // Prefer "at MERCHANT"
  let merchantMatch = normalized.match(
    /(?:at|to|from)\s+([A-Za-z0-9][A-Za-z0-9 &.\-']+?)(?:\s+on|\s+for|\.|$)/i
  );

  if (merchantMatch) {
    description = merchantMatch[1].trim();
  } else {
    // fallback: extract short meaningful line
    const lines = normalized.split(".");
    for (const line of lines) {
      if (line.toLowerCase().includes(type.toLowerCase()) && line.length < 80) {
        description = line.trim();
        break;
      }
    }
  }

  console.log("✅ Parsed Transaction:", {
    type,
    amount,
    description,
    transactionDate,
  });

  return {
    type,
    amount,
    description,
    currency: "INR",
    transactionDate,
  };
}

module.exports = { parseTransaction };
