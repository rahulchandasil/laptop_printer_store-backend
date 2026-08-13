const crypto = require("crypto");
const User = require("../models/user.model");
const Otp = require("../models/otp.model");
const sendOTPEmail = require("../utils/sendEmail");
const { generateOTP, hashOTP } = require("../utils/otp");
const { OAuth2Client } = require("google-auth-library");

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
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

    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email already registered",
      });
    }

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
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
    console.error("Register error:", error.message);
    res.status(500).json({
      success: false,
      message: "Registration failed",
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() });

    if (!user || user.password !== password) {
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
    console.error("Login error:", error.message);
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
        message: "Please enter a valid email address.",
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address.",
      });
    }

    const existingOtp = await Otp.findOne({ email }).sort({ createdAt: -1 });

    if (existingOtp && existingOtp.otpLastSentAt) {
      const secondsSinceLastOTP =
        (Date.now() - existingOtp.otpLastSentAt.getTime()) / 1000;

      if (secondsSinceLastOTP < 60) {
        const remaining = Math.ceil(60 - secondsSinceLastOTP);
        return res.status(429).json({
          success: false,
          message: `Please wait ${remaining} seconds before requesting another OTP.`,
        });
      }
    }

    const otp = generateOTP();
    const otpHash = hashOTP(otp);

    const otpDoc = await Otp.create({
      email,
      otpHash,
      otpExpiresAt: new Date(Date.now() + 5 * 60 * 1000),
      otpAttempts: 0,
      otpLastSentAt: new Date(),
    });

    await sendOTPEmail(email, otp);

    return res.status(200).json({
      success: true,
      message: "OTP sent successfully",
    });
  } catch (error) {
    console.error("Send OTP error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to send OTP. Please try again later.",
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

    const otpDoc = await Otp.findOne({ email }).sort({ createdAt: -1 });

    if (!otpDoc || !otpDoc.otpHash) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired OTP",
      });
    }

    if (otpDoc.otpAttempts >= 5) {
      await Otp.deleteOne({ _id: otpDoc._id });

      return res.status(429).json({
        success: false,
        message: "Too many incorrect attempts. Please request a new OTP.",
      });
    }

    if (!otpDoc.otpExpiresAt || otpDoc.otpExpiresAt.getTime() < Date.now()) {
      await Otp.deleteOne({ _id: otpDoc._id });

      return res.status(401).json({
        success: false,
        message: "OTP has expired. Please request a new OTP.",
      });
    }

    const submittedHash = hashOTP(otp);
    const isValid = crypto.timingSafeEqual(
      Buffer.from(submittedHash, "hex"),
      Buffer.from(otpDoc.otpHash, "hex")
    );

    if (!isValid) {
      otpDoc.otpAttempts += 1;
      await otpDoc.save();

      if (otpDoc.otpAttempts >= 5) {
        await Otp.deleteOne({ _id: otpDoc._id });

        return res.status(429).json({
          success: false,
          message: "Too many incorrect attempts. Please request a new OTP.",
        });
      }

      return res.status(401).json({
        success: false,
        message: "Invalid OTP.",
      });
    }

    await Otp.deleteOne({ _id: otpDoc._id });

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        email,
        name: "",
        password: null,
      });
    }

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
    console.error("Verify OTP error:", error.message);
    return res.status(500).json({
      success: false,
      message: "OTP verification failed",
    });
  }
};

const googleLogin = async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential) {
      return res.status(400).json({ success: false, message: "Credential is required" });
    }

    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const email = payload.email.trim().toLowerCase();
    const name = payload.name;
    const googleId = payload.sub;
    const picture = payload.picture;
    const email_verified = payload.email_verified;

    if (!email_verified) {
      return res.status(401).json({ success: false, message: "Google email is not verified." });
    }

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        email,
        name: "", // Will be filled in Complete Profile step
        password: null,
        googleId,
        provider: "google",
        picture,
      });
    } else {
      // Link the google account if not linked
      if (!user.googleId) {
        user.googleId = googleId;
        user.provider = "google"; // or keep as local, but signify google is linked
        if (!user.picture) user.picture = picture;
        await user.save();
      }
    }

    return res.status(200).json({
      success: true,
      message: "Google login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        picture: user.picture,
      },
    });
  } catch (error) {
    console.error("Google Login error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Google login failed",
    });
  }
};

const completeProfile = async (req, res) => {
  try {
    const { userId, name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: "Name is required" });
    }

    if (!userId) {
      return res.status(400).json({ success: false, message: "User ID is required" });
    }

    let user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    user.name = name.trim();
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Profile completed successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        picture: user.picture,
      },
    });
  } catch (error) {
    console.error("Complete Profile error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to complete profile",
    });
  }
};

module.exports = {
  register,
  login,
  sendOTP,
  verifyOTP,
  googleLogin,
  completeProfile,
};
