const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    // 🔑 LOGGED-IN USER
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // 💳 CREDIT / DEBIT
    type: {
      type: String,
      enum: ["CREDIT", "DEBIT"],
      required: true,
      index: true,
    },

    // 💰 AMOUNT
    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    // 🏦 MERCHANT / DESCRIPTION
    description: {
      type: String,
      trim: true,
      default: "Unknown",
      index: true,
    },

    // 💱 CURRENCY
    currency: {
      type: String,
      default: "INR",
    },

    // 📩 SOURCE
    source: {
      type: String,
      enum: ["GMAIL", "MANUAL"],
      default: "GMAIL",
      index: true,
    },

    // ✉️ EMAIL MESSAGE ID (from Gmail)
    emailId: {
      type: String,
      required: true,
    },

    // 📅 TRANSACTION DATE (parsed from email or fallback)
    transactionDate: {
      type: Date,
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

/**
 * ✅ PREVENT DUPLICATES
 * Same email should not create multiple transactions
 * (even if scanner runs again)
 */
transactionSchema.index(
  { emailId: 1 },
  { unique: true }
);

module.exports = mongoose.model("Transaction", transactionSchema);
