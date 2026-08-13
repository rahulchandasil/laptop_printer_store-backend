require("dotenv").config({ path: __dirname + "/../../.env" });
const mongoose = require("mongoose");
const Product = require("../models/product.model");

const laptopSpecs = {
  processor: "Intel Core i5-1235U (10 Cores)",
  operatingSystem: "Windows 11 Home",
  graphics: "Intel Iris Xe Graphics",
  memory: "16GB LPDDR5x",
  storage: "512GB NVMe M.2 SSD",
  display: "15.6-inch FHD (1920x1080) Anti-glare",
  color: "Silver",
  battery: "54Wh, 4-cell",
  camera: "1080p FHD RGB",
  ports: "2x USB-C, 1x USB-A, 1x HDMI 2.0",
  weight: "1.65 kg",
  warranty: "1 Year Premium Support"
};

const printerSpecs = {
  printTechnology: "Inkjet",
  printSpeed: "15 ppm (Black), 10 ppm (Color)",
  resolution: "4800 x 1200 dpi",
  connectivity: "Wi-Fi 802.11b/g/n, Hi-Speed USB 2.0",
  paperSize: "A4, A5, B5, Letter",
  duplex: "Manual",
  color: "Color",
  scanner: "Yes (CIS Flatbed)",
  copier: "Yes",
  monthlyDutyCycle: "Up to 5,000 pages",
  warranty: "1 Year Return to Base"
};

async function seedSpecifications() {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error("MONGODB_URI is not defined in the .env file");
    }

    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB...");

    const products = await Product.find({});
    let updatedCount = 0;

    for (const product of products) {
      let isModified = false;
      
      // Use direct update to bypass Map assignment issues
      let updates = {};

      if (!product.specifications || Object.keys(product.specifications).length === 0 || (product.specifications.size !== undefined && product.specifications.size === 0)) {
        if (product.category === "laptop") {
          updates.specifications = laptopSpecs;
        } else if (product.category === "printer") {
          updates.specifications = printerSpecs;
        }
      }

      if (!product.originalPrice) {
        updates.originalPrice = Math.round(product.price * 1.15);
      }

      // Add a realistic rating if missing
      if (!product.rating) {
        updates.rating = parseFloat((Math.random() * (5.0 - 4.0) + 4.0).toFixed(1)); // 4.0 to 5.0
        updates.reviewCount = Math.floor(Math.random() * 300) + 15;
      }
      
      if (!product.images || product.images.length === 0) {
        updates.images = [product.image];
      }

      if (Object.keys(updates).length > 0) {
        await Product.findByIdAndUpdate(product._id, { $set: updates });
        updatedCount++;
        console.log(`Updated product: ${product.name}`);
      }
    }

    console.log(`Migration completed successfully! Updated ${updatedCount} products.`);
  } catch (error) {
    console.error("Error migrating products:", error);
  } finally {
    mongoose.connection.close();
  }
}

seedSpecifications();
