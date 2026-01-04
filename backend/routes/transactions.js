const express = require("express");
const Transaction = require("../models/Transaction");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// 🔐 GET ALL TRANSACTIONS FOR LOGGED-IN USER
router.get("/", authMiddleware, async (req, res) => {
  try {
    // ✅ SAFELY extract userId from auth middleware
    const userId = req.user?.userId || req.user?.id;

    if (!userId) {
      console.warn("⚠️ User ID missing in request");
      return res.status(401).json({ message: "Unauthorized" });
    }

    const transactions = await Transaction.find({ userId })
      .sort({ transactionDate: -1 })
      .lean(); // ⚡ faster & cleaner JSON

    console.log(`📊 Returned ${transactions.length} transaction(s)`);

    res.json(transactions);
  } catch (error) {
    console.error("❌ TRANSACTION FETCH ERROR:", error);
    res.status(500).json({ message: "Failed to fetch transactions" });
  }
});

module.exports = router;
