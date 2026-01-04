require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const jwt = require("jsonwebtoken");

// 🔥 AUTO SCAN SERVICE
const { startGmailAutoScan } = require("./services/gmailAutoScanner");

const app = express();

// -------------------- MIDDLEWARE --------------------
app.use(cors());
app.use(express.json());

// -------------------- TEST ROUTES --------------------
app.get("/api/test", (req, res) => {
  res.json({ message: "Backend reachable" });
});

app.get("/api/jwt-test", (req, res) => {
  try {
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET not defined");
    }

    const token = jwt.sign({ test: "ok" }, process.env.JWT_SECRET);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    res.json({ token, decoded });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------- ROUTES --------------------
const authRoutes = require("./routes/auth");
const gmailRoutes = require("./routes/gmail");
const transactionRoutes = require("./routes/transactions");

app.use("/api/auth", authRoutes);
app.use("/api/gmail", gmailRoutes);
app.use("/api/transactions", transactionRoutes);

// -------------------- SERVER START --------------------
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`✅ Server listening on http://localhost:${PORT}`);
});

// -------------------- DATABASE + CRON --------------------
mongoose
  .connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 5000,
  })
  .then(() => {
    console.log("✅ MongoDB Atlas connected");

    // 🔄 START AUTO GMAIL SCAN (EVERY 1 MINUTE)
    startGmailAutoScan();
    console.log("⏱️ Gmail auto-scan scheduled every 1 minute");
  })
  .catch((err) => console.error("❌ MongoDB error:", err));

// -------------------- DB CHECK (OPTIONAL) --------------------
app.get("/api/db-check", async (req, res) => {
  try {
    const result = await mongoose.connection.db
      .collection("check")
      .insertOne({ ok: true, time: new Date() });

    res.json({ success: true, result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
