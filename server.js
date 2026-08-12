require("dotenv").config();

const app = require("./src/app");
const connectDB = require("./src/config/db");
const { verifyEmailTransporter } = require("./src/utils/sendEmail");

const PORT = process.env.PORT || 4200;

connectDB();
verifyEmailTransporter();

app.listen(PORT);