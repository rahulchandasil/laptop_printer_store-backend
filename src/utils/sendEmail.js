const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendOTPEmail = async (email, otp) => {
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Your Login OTP",
    html: `
      <div style="font-family: Arial; padding: 20px;">
        <h2>Laptop & Printer Store</h2>

        <p>Your login OTP is:</p>

        <h1 style="letter-spacing: 8px;">
          ${otp}
        </h1>

        <p>This OTP will expire in 5 minutes.</p>

        <p>If you did not request this OTP, please ignore this email.</p>
      </div>
    `,
  });
};

module.exports = sendOTPEmail;