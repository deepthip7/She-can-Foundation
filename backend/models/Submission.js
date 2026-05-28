const mongoose = require("mongoose");

const submissionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [80, "Name cannot exceed 80 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"],
    },
    phone: {
      type: String,
      trim: true,
      default: "",
    },
    subject: {
      type: String,
      required: [true, "Subject is required"],
      enum: {
        values: ["mentorship", "volunteer", "donation", "partnership", "other"],
        message: "Invalid subject",
      },
    },
    message: {
      type: String,
      required: [true, "Message is required"],
      trim: true,
      minlength: [10, "Message must be at least 10 characters"],
      maxlength: [1000, "Message cannot exceed 1000 characters"],
    },
    newsletter: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ["new", "read", "replied"],
      default: "new",
    },
    ipAddress: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true, // adds createdAt + updatedAt
  }
);

// Index for searching
submissionSchema.index({ email: 1 });
submissionSchema.index({ subject: 1 });
submissionSchema.index({ createdAt: -1 });
submissionSchema.index({ name: "text", email: "text", message: "text" });

module.exports = mongoose.model("Submission", submissionSchema);
