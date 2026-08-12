require("dotenv").config();


const app = require("./src/app");
const connectDB = require("./src/config/db");
const { verifyEmailTransporter } = require("./src/utils/sendEmail");

const PORT = process.env.PORT || 4200;

const startServer = async () => {
  await connectDB();

  const smtpVerified = await verifyEmailTransporter();

  if (!smtpVerified) {
    console.error(
      "SMTP verification failed. Ensure EMAIL_USER and EMAIL_PASS are configured."
    );
    process.exit(1);
  }

  app.listen(PORT);
};

startServer();