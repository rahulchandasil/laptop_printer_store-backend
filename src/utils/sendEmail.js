const nodemailer = require("nodemailer");


// Use explicit SMTP host/port to prefer IPv4 and STARTTLS (port 587)
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // use STARTTLS
  requireTLS: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const verifyEmailTransporter = async () => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.error("EMAIL_USER or EMAIL_PASS is not configured");
      return;
    }

    await transporter.verify();
    console.log("SMTP transporter verified");
  } catch (error) {
    // Log only the error message to avoid exposing secrets or network details.
    console.error("SMTP transporter verification failed:", error.message);
  }
};

const sendOTPEmail = async (email, otp) => {
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your Login OTP",

      html: `
        <div style="
          font-family: Arial, sans-serif;
          max-width: 500px;
          margin: auto;
          padding: 30px;
          border: 1px solid #eee;
          border-radius: 12px;
        ">

          <h2>Laptop & Printer Store</h2>

          <p>Your login OTP is:</p>

          <h1 style="
            letter-spacing: 8px;
            text-align: center;
            background: #f1f5f9;
            padding: 20px;
            border-radius: 10px;
          ">
            ${otp}
          </h1>

          <p>
            This OTP will expire in 5 minutes.
          </p>

          <p>
            If you did not request this OTP, please ignore this email.
          </p>

        </div>
      `,
    });

    return true;
  } catch (error) {
    console.error("OTP email sending failed:", error.message);
    throw error;
  }
};

module.exports = sendOTPEmail;
module.exports.verifyEmailTransporter =
  verifyEmailTransporter;