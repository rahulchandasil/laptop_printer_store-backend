const Product = require("../models/product.model");

// Get products
const getProducts = async (req, res) => {
  try {
    const { category, brand } = req.query;

    const filter = {};

    if (category) {
      filter.category = category.toLowerCase();
    }

    if (brand) {
      filter.brand = {
        $regex: `^${brand}$`,
        $options: "i",
      };
    }

    const products = await Product.find(filter);

    res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch products",
      error: error.message,
    });
  }
};

// Get single product
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch product",
      error: error.message,
    });
  }
};
const createProduct = async (req, res) => {
  try {
    const { name, category, brand, description, price, image } = req.body;

    if (!name || !category || !brand || !description || !price || !image) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const product = await Product.create({
      name,
      category,
      brand,
      description,
      price,
      image,
    });

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create product",
      error: error.message,
    });
  }
};
module.exports = {
  getProducts,
  getProductById,
  createProduct,
};