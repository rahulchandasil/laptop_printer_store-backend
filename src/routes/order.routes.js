const express = require("express");
const { authenticate } = require("../middleware/auth.middleware.js");
const {
  createOrder,
  getMyOrders,
  getOrderById,
} = require("../controller/order.controller.js");

const orderRouter = express.Router();

orderRouter.post("/", authenticate, createOrder);
orderRouter.get("/my-orders", authenticate, getMyOrders);
orderRouter.get("/:orderId", authenticate, getOrderById);

module.exports = orderRouter;