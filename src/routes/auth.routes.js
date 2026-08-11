const express = require("express");

const {
  register,
  login,
  sendOTP,
  verifyOTP
} = require("../controller/auth.controller.js");

const authRouter = express.Router();

authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.post("/send-otp", sendOTP);
authRouter.post("/verify-otp", verifyOTP);

module.exports = authRouter;