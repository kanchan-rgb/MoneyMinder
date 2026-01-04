const mongoose = require("mongoose");

const gmailTokenSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    email: {
      type: String,
      required: true,
    },

    access_token: {
      type: String,
      required: true,
    },

    refresh_token: {
      type: String,
      required: true,
    },

    token_type: String,
    scope: String,
    expiry_date: Number,
  },
  { timestamps: true }
);

module.exports = mongoose.model("GmailToken", gmailTokenSchema);
