const crypto = require("crypto");
const User = require("../models/user.model");
const sendOTPEmail = require("../utils/sendEmail");

const {
  generateOTP,
  hashOTP,
} = require("../utils/otp");

// Register
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email already registered",
      });
    }

    const user = await User.create({
      name,
      email,
      password,
    });

    res.status(201).json({
      success: true,
      message: "Registration successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({
      success: false,
      message: "Registration failed",
    });
  }
};

// Login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    if (user.password !== password) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    res.status(200).json({
      success: true,
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Login failed",
    });
  }
};
const sendOTP = async (req, res) => {
  try {
    const email = req.body.email?.trim().toLowerCase();

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    let user = await User.findOne({ email });

    // Create temporary account for a new email
    if (!user) {
      user = await User.create({
        email,
        name: "",
        password: null,
      });
    }

    // 60-second resend protection
    if (user.otpLastSentAt) {
      const secondsSinceLastOTP =
        (Date.now() - user.otpLastSentAt.getTime()) / 1000;

      if (secondsSinceLastOTP < 60) {
        const remaining = Math.ceil(
          60 - secondsSinceLastOTP
        );

        return res.status(429).json({
          success: false,
          message: `Please wait ${remaining} seconds before requesting another OTP.`,
        });
      }
    }

    const otp = generateOTP();
    const otpHash = hashOTP(otp);

    user.otpHash = otpHash;
    user.otpExpires = new Date(
      Date.now() + 5 * 60 * 1000
    );

    user.otpAttempts = 0;
    user.otpLastSentAt = new Date();

    await user.save();

    await sendOTPEmail(email, otp);

    return res.status(200).json({
      success: true,
      message: "OTP sent successfully",
    });

  } catch (error) {
    console.error("Send OTP error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to send OTP",
    });
  }
};
const verifyOTP = async (req, res) => {
  try {
    const email = req.body.email?.trim().toLowerCase();
    const otp = req.body.otp?.trim();

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required",
      });
    }

    if (!/^\d{6}$/.test(otp)) {
      return res.status(400).json({
        success: false,
        message: "OTP must be 6 digits",
      });
    }

    const user = await User.findOne({ email });

    if (!user || !user.otpHash) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired OTP",
      });
    }

    // Maximum 5 attempts
    if (user.otpAttempts >= 5) {
      user.otpHash = null;
      user.otpExpires = null;
      user.otpAttempts = 0;

      await user.save();

      return res.status(429).json({
        success: false,
        message: "Too many incorrect attempts. Please request a new OTP.",
      });
    }

    // Check expiry
    if (
      !user.otpExpires ||
      user.otpExpires.getTime() < Date.now()
    ) {
      user.otpHash = null;
      user.otpExpires = null;
      user.otpAttempts = 0;

      await user.save();

      return res.status(401).json({
        success: false,
        message: "OTP has expired. Please request a new OTP.",
      });
    }

    const submittedHash = hashOTP(otp);

    const isValid = crypto.timingSafeEqual(
      Buffer.from(submittedHash, "hex"),
      Buffer.from(user.otpHash, "hex")
    );

    if (!isValid) {
      user.otpAttempts += 1;

      await user.save();

      return res.status(401).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    // Successful verification
    user.otpHash = null;
    user.otpExpires = null;
    user.otpAttempts = 0;
    user.otpLastSentAt = null;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "OTP login successful",

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });

  } catch (error) {
    console.error("Verify OTP error:", error);

    return res.status(500).json({
      success: false,
      message: "OTP verification failed",
    });
  }
};
module.exports = {
  register,
  login,
  sendOTP,
  verifyOTP
};