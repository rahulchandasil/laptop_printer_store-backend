const express = require("express");

const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
} = require("../controller/product.controller.js");

const productRouter = express.Router();

productRouter.get("/", getProducts);
productRouter.get("/:id", getProductById);
productRouter.post("/",createProduct);
productRouter.put("/:id", updateProduct);

module.exports = productRouter;