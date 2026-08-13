const express = require("express");

const {
  register,
  login,
  sendOTP,
  verifyOTP,
  googleLogin,
  completeProfile
} = require("../controller/auth.controller.js");

const authRouter = express.Router();

authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.post("/send-otp", sendOTP);
authRouter.post("/verify-otp", verifyOTP);
authRouter.post("/google", googleLogin);
authRouter.post("/complete-profile", completeProfile);

module.exports = authRouter;
