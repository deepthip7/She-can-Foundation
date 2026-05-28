require("dotenv").config();
const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const connectDB = require("./config/db");

const app = express();

// ── Connect to MongoDB ──────────────────────────────────
connectDB();

// ── Middleware ──────────────────────────────────────────
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true }));

// ── Rate Limiting ───────────────────────────────────────
// General API limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: { success: false, message: "Too many requests. Please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict limiter for public form submission
const submitLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  message: { success: false, message: "Too many form submissions. Please try again in an hour." },
});

app.use("/api", apiLimiter);

// ── Routes ──────────────────────────────────────────────
app.use("/api/auth", require("./routes/auth"));
app.use("/api/submissions", require("./routes/submissions"));

// Apply strict rate limit only to public POST
const submissionRouter = require("./routes/submissions");

// ── Health check ─────────────────────────────────────────
app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "She Can Foundation API is running 🌸", timestamp: new Date() });
});

// ── 404 handler ──────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found." });
});

// ── Global error handler ─────────────────────────────────
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error.",
  });
});

// ── Start server ─────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🌸 She Can Foundation API running on http://localhost:${PORT}`);
  console.log(`📋 Seed admin: POST http://localhost:${PORT}/api/auth/seed\n`);
});
