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

    const serializedProducts = products.map((p) => {
      const obj = p.toObject();
      if (obj.specifications instanceof Map) {
        obj.specifications = Object.fromEntries(obj.specifications);
      } else if (p.specifications instanceof Map) {
        obj.specifications = Object.fromEntries(p.specifications);
      }
      return obj;
    });

    res.status(200).json({
      success: true,
      count: serializedProducts.length,
      products: serializedProducts,
    });
  } catch (error) {
    console.error("Get products error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch products",
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

    const obj = product.toObject();
    if (obj.specifications instanceof Map) {
      obj.specifications = Object.fromEntries(obj.specifications);
    } else if (product.specifications instanceof Map) {
      obj.specifications = Object.fromEntries(product.specifications);
    }

    res.status(200).json({
      success: true,
      product: obj,
    });
  } catch (error) {
    console.error("Get product error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch product",
    });
  }
};
const createProduct = async (req, res) => {
  try {
    console.log("FULL REQUEST BODY:");
    console.log(JSON.stringify(req.body, null, 2));

    let { 
      name, category, brand, description, price, image, 
      specifications, originalPrice, rating, reviewCount, images, isNewLaunch 
    } = req.body;

    console.log("SPECIFICATIONS RECEIVED:", specifications);

    // If specifications was sent as a JSON string, parse it safely
    if (typeof specifications === "string") {
      try {
        specifications = JSON.parse(specifications);
      } catch (err) {
        console.error("Failed to parse specifications string:", err);
      }
    }

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
      ...(specifications && { specifications }),
      ...(originalPrice && { originalPrice }),
      ...(rating && { rating }),
      ...(reviewCount !== undefined && { reviewCount }),
      ...(images && { images }),
      ...(isNewLaunch !== undefined && { isNewLaunch }),
    });

    const savedProductObject = product.toObject();

    // Ensure Map is converted to plain object for the API response
    if (savedProductObject.specifications instanceof Map) {
      savedProductObject.specifications = Object.fromEntries(savedProductObject.specifications);
    } else if (product.specifications instanceof Map) {
      savedProductObject.specifications = Object.fromEntries(product.specifications);
    }


    res.status(201).json({
      success: true,
      message: "Product created successfully",
      product: savedProductObject,
    });
  } catch (error) {
    console.error("Create product error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create product",
    });
  }
};
const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    let { specifications, originalPrice, rating, reviewCount, images, isNewLaunch, name, category, brand, description, price, image } = req.body;
    
    // If specifications was sent as a JSON string, parse it safely
    if (typeof specifications === "string") {
      try {
        specifications = JSON.parse(specifications);
      } catch (err) {
        console.error("Failed to parse specifications string:", err);
      }
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      {
        ...(name && { name }),
        ...(category && { category }),
        ...(brand && { brand }),
        ...(description && { description }),
        ...(price && { price }),
        ...(image && { image }),
        ...(specifications && { specifications }),
        ...(originalPrice && { originalPrice }),
        ...(rating && { rating }),
        ...(reviewCount !== undefined && { reviewCount }),
        ...(images && { images }),
        ...(isNewLaunch !== undefined && { isNewLaunch }),
      },
      { new: true, runValidators: true }
    );

    const obj = updatedProduct.toObject();
    if (obj.specifications instanceof Map) {
      obj.specifications = Object.fromEntries(obj.specifications);
    } else if (updatedProduct.specifications instanceof Map) {
      obj.specifications = Object.fromEntries(updatedProduct.specifications);
    }

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product: obj,
    });
  } catch (error) {
    console.error("Update product error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update product",
    });
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
};