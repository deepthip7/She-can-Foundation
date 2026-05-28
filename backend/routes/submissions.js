const express = require("express");
const router = express.Router();
const { body, query, validationResult } = require("express-validator");
const Submission = require("../models/Submission");
const protect = require("../middleware/auth");

// ── Validation rules ────────────────────────────────────
const submitValidation = [
  body("name").trim().isLength({ min: 2, max: 80 }).withMessage("Name must be 2–80 characters."),
  body("email").isEmail().normalizeEmail().withMessage("Invalid email address."),
  body("phone").optional().trim(),
  body("subject")
    .isIn(["mentorship", "volunteer", "donation", "partnership", "other"])
    .withMessage("Invalid subject."),
  body("message").trim().isLength({ min: 10, max: 1000 }).withMessage("Message must be 10–1000 characters."),
  body("newsletter").optional().isBoolean(),
];

// ── POST /api/submissions  (public) ─────────────────────
router.post("/", submitValidation, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }

  try {
    const { name, email, phone, subject, message, newsletter } = req.body;
    const submission = await Submission.create({
      name,
      email,
      phone: phone || "",
      subject,
      message,
      newsletter: !!newsletter,
      ipAddress: req.ip,
    });

    res.status(201).json({
      success: true,
      message: "Form Submitted Successfully! We'll get back to you soon.",
      data: { id: submission._id },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error. Please try again." });
  }
});

// ── GET /api/submissions  (admin only) ──────────────────
router.get("/", protect, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      subject = "",
      status = "",
      sort = "-createdAt",
    } = req.query;

    const filter = {};
    if (subject) filter.subject = subject;
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { message: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [submissions, total] = await Promise.all([
      Submission.find(filter).sort(sort).skip(skip).limit(parseInt(limit)),
      Submission.countDocuments(filter),
    ]);

    // Stats
    const stats = await Submission.aggregate([
      {
        $group: {
          _id: "$subject",
          count: { $sum: 1 },
        },
      },
    ]);
    const newsletterCount = await Submission.countDocuments({ newsletter: true });
    const totalCount = await Submission.countDocuments();

    res.json({
      success: true,
      data: submissions,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        limit: parseInt(limit),
      },
      stats: {
        total: totalCount,
        newsletter: newsletterCount,
        bySubject: stats.reduce((acc, s) => { acc[s._id] = s.count; return acc; }, {}),
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error." });
  }
});

// ── GET /api/submissions/:id  (admin only) ──────────────
router.get("/:id", protect, async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id);
    if (!submission) return res.status(404).json({ success: false, message: "Not found." });
    res.json({ success: true, data: submission });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error." });
  }
});

// ── PATCH /api/submissions/:id/status  (admin only) ─────
router.patch("/:id/status", protect, async (req, res) => {
  try {
    const { status } = req.body;
    if (!["new", "read", "replied"].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status." });
    }
    const submission = await Submission.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!submission) return res.status(404).json({ success: false, message: "Not found." });
    res.json({ success: true, data: submission });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error." });
  }
});

// ── DELETE /api/submissions/:id  (admin only) ───────────
router.delete("/:id", protect, async (req, res) => {
  try {
    await Submission.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Submission deleted." });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error." });
  }
});

// ── DELETE /api/submissions  (admin — bulk delete all) ──
router.delete("/", protect, async (req, res) => {
  try {
    await Submission.deleteMany({});
    res.json({ success: true, message: "All submissions deleted." });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error." });
  }
});

module.exports = router;
