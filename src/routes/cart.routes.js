const express = require("express");

const {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
} = require("../controller/cart.controller.js");

const cartRouter = express.Router();

cartRouter.get("/:userId", getCart);

cartRouter.post("/:userId", addToCart);

cartRouter.put("/:userId/:productId", updateCartItem);

cartRouter.delete("/:userId/:productId", removeFromCart);

module.exports = cartRouter;