const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      default: "",
    },

    email: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
      default: null,
    },

    phone: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      default: null,
    },

    password: {
      type: String,
      minlength: 6,
      default: null,
    },

    otpHash: {
      type: String,
      default: null,
    },

    otpExpires: {
      type: Date,
      default: null,
    },

    otpAttempts: {
      type: Number,
      default: 0,
    },

    otpLastSentAt: {
      type: Date,
      default: null,
    },
    
    googleId: {
      type: String,
      default: null,
      sparse: true,
      unique: true,
    },

    provider: {
      type: String,
      enum: ["local", "google"],
      default: "local",
    },

    picture: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);
