const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");
const protect = require("../middleware/auth");

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

// ── POST /api/auth/login ────────────────────────────────
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required." });
    }

    const admin = await Admin.findOne({ email: email.toLowerCase() }).select("+password");
    if (!admin || !(await admin.comparePassword(password))) {
      return res.status(401).json({ success: false, message: "Invalid email or password." });
    }

    const token = signToken(admin._id);
    res.json({
      success: true,
      token,
      admin: { id: admin._id, email: admin.email, name: admin.name },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error." });
  }
});

// ── GET /api/auth/me  (protected) ───────────────────────
router.get("/me", protect, (req, res) => {
  res.json({
    success: true,
    admin: { id: req.admin._id, email: req.admin.email, name: req.admin.name },
  });
});

// ── POST /api/auth/seed  ────────────────────────────────
// Creates the default admin if none exists (run once)
router.get("/seed", async (req, res) => {
  try {
    const existing = await Admin.findOne({ email: "admin@shecan.org" });
    if (existing) {
      return res.json({ success: true, message: "Admin already exists." });
    }
    await Admin.create({
      email: "admin@shecan.org",
      password: "shecan2025",
      name: "She Can Admin",
    });
    res.status(201).json({ success: true, message: "Admin created. Email: admin@shecan.org | Password: shecan2025" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error." });
  }
});

module.exports = router;
