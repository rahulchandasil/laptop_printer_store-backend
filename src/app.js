const express = require("express");
const cors = require("cors");

const productRoutes = require("./routes/product.routes");
const authRoutes = require("./routes/auth.routes.js");
const cartRoutes = require("./routes/cart.routes.js");
const orderRouter = require("./routes/order.routes.js");

const app = express();

app.use(cors());
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