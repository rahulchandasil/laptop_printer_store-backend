require("dotenv").config();

console.log("EMAIL_USER configured:", Boolean(process.env.EMAIL_USER));
console.log("EMAIL_PASS configured:", Boolean(process.env.EMAIL_PASS));

const app = require("./src/app");
const connectDB = require("./src/config/db");
const { verifyEmailTransporter } = require("./src/utils/sendEmail");

const PORT = process.env.PORT || 5000;

// Initialize database connection (connectDB handles fatal errors)
connectDB();

// Start server immediately and perform SMTP verification asynchronously.
// Do not block or exit the process when SMTP verification fails.
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
  verifyEmailTransporter();
});