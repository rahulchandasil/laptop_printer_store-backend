const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    otpHash: {
      type: String,
      required: true,
    },
    otpExpiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 },
    },
    otpAttempts: {
      type: Number,
      default: 0,
    },
    otpLastSentAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

otpSchema.index({ email: 1, createdAt: -1 });

module.exports = mongoose.model("Otp", otpSchema);
