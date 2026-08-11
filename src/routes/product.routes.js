const express = require("express");

const {
  getProducts,
  getProductById,
  createProduct,
} = require("../controller/product.controller.js");

const productRouter = express.Router();

productRouter.get("/", getProducts);
productRouter.get("/:id", getProductById);
productRouter.post("/",createProduct);

module.exports = productRouter;