const express = require("express");

const {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
} = require("../controller/cart.controller.js");

const cartRouter = express.Router();

const { authenticate } = require("../middleware/auth.middleware.js");

cartRouter.get("/", authenticate, getCart);

cartRouter.post("/", authenticate, addToCart);

cartRouter.put("/:productId", authenticate, updateCartItem);

cartRouter.delete("/:productId", authenticate, removeFromCart);

module.exports = cartRouter;