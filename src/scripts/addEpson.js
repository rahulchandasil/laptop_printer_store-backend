require("dotenv").config({ path: __dirname + "/../../.env" });
const mongoose = require("mongoose");
const Product = require("../models/product.model");

const newProduct = {
  name: "Epson EcoTank L5290",
  brand: "Epson",
  category: "printer",
  price: 21999,
  originalPrice: Math.round(21999 * 1.15),
  description: "Feature-rich Epson EcoTank printer suitable for home offices and small businesses.",
  image: "https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6",
  images: ["https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6"],
  rating: 4.6,
  reviewCount: 112,
  isNewLaunch: true,
  specifications: {
    printTechnology: "EcoTank Inkjet",
    printSpeed: "33 ppm (Black), 15 ppm (Color)",
    resolution: "5760 x 1440 dpi",
    connectivity: "Wi-Fi, USB, Ethernet",
    paperSize: "A4, Legal, Letter",
    duplex: "Manual",
    color: "Color",
    scanner: "Yes (ADF)",
    copier: "Yes",
    monthlyDutyCycle: "Up to 3,000 pages",
    warranty: "1 Year"
  }
};

async function addProduct() {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error("MONGODB_URI is not defined");
    }

    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB...");

    // Check if it already exists
    const existing = await Product.findOne({ name: newProduct.name });
    if (existing) {
      console.log("Product already exists, updating it...");
      await Product.updateOne({ _id: existing._id }, newProduct);
      console.log("Product updated successfully.");
    } else {
      await Product.create(newProduct);
      console.log("Product created successfully.");
    }

  } catch (error) {
    console.error("Error:", error);
  } finally {
    mongoose.connection.close();
  }
}

addProduct();
