const express = require("express");

const {
  createOrder,
  getUserOrders,
} = require("../controller/order.controller.js");

const orderRouter = express.Router();

orderRouter.post("/", createOrder);

orderRouter.get("/:userId", getUserOrders);

module.exports = orderRouter;