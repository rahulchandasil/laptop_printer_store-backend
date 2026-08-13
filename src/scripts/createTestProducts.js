require("dotenv").config({ path: __dirname + "/../../.env" });
const mongoose = require("mongoose");
const Product = require("../models/product.model");

const testLaptop = {
  name: "Dell Latitude 15",
  brand: "Dell",
  category: "laptop",
  price: 67999,
  description: "Business laptop",
  image: "https://images.unsplash.com/photo-1593642632823-8f785ba67e45",
  specifications: {
    processor: "Intel Core i5",
    operatingSystem: "Windows 11 Home",
    graphics: "Intel Graphics",
    memory: "16GB",
    storage: "512GB SSD",
    display: "15.6-inch FHD",
    color: "Silver"
  }
};

const testPrinter = {
  name: "Epson EcoTank L5290",
  brand: "Epson",
  category: "printer",
  price: 21999,
  description: "Feature-rich Epson EcoTank printer",
  image: "https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6",
  specifications: {
    printTechnology: "Inkjet",
    printSpeed: "10 ipm",
    printResolution: "5760 x 1440 dpi",
    connectivity: "Wi-Fi, USB",
    paperSize: "A4",
    duplex: "Manual",
    color: "Color",
    scanner: "Yes",
    copier: "Yes",
    warranty: "1 Year"
  }
};

async function createTestProducts() {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error("MONGODB_URI is not defined");
    }

    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB...");

    // Create or update laptop
    const existingLaptop = await Product.findOne({ name: testLaptop.name });
    if (existingLaptop) {
      await Product.findByIdAndUpdate(existingLaptop._id, testLaptop);
      console.log("Updated test laptop.");
    } else {
      await Product.create(testLaptop);
      console.log("Created test laptop.");
    }

    // Create or update printer
    const existingPrinter = await Product.findOne({ name: testPrinter.name });
    if (existingPrinter) {
      await Product.findByIdAndUpdate(existingPrinter._id, testPrinter);
      console.log("Updated test printer.");
    } else {
      await Product.create(testPrinter);
      console.log("Created test printer.");
    }

  } catch (error) {
    console.error("Error creating test products:", error);
  } finally {
    mongoose.connection.close();
  }
}

createTestProducts();
