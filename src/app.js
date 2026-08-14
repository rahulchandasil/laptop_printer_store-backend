const express = require("express");
const cors = require("cors");

const productRoutes = require("./routes/product.routes");
const authRoutes = require("./routes/auth.routes.js");
const cartRoutes = require("./routes/cart.routes.js");
const orderRouter = require("./routes/order.routes.js");


const app = express();

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    
    const frontendUrl = process.env.FRONTEND_URL;
    if (frontendUrl) {
      // Remove trailing slash for comparison
      const normalizedFrontend = frontendUrl.replace(/\/$/, "");
      const normalizedOrigin = origin.replace(/\/$/, "");
      
      if (normalizedOrigin === normalizedFrontend) {
        return callback(null, true);
      }
    }
    
    if (origin.startsWith("http://localhost:")) {
      return callback(null, true);
    }
    
    // For Vercel deployments, often preview URLs are used
    if (origin.endsWith(".vercel.app")) {
      return callback(null, true);
    }
    
    callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
};
app.use(cors(corsOptions));
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Laptop & Printer Store API is running",
  });
});

app.use("/api/products", productRoutes);
app.use("/api/auth",authRoutes);
app.use("/api/cart",cartRoutes);
app.use("/api/orders", orderRouter);

module.exports = app;