const Order = require("../models/order.model.js");
const Cart = require("../models/cart.model.js");
const Product = require("../models/product.model.js");
const mongoose = require("mongoose");

const createOrder = async (req, res) => {
  try {
    const userId = req.user._id;
    const {
      items,
      name,
      mobile,
      address,
      totalPrice,
    } = req.body;

    const validItems = Array.isArray(items) && items.length > 0 && items.every(
      (item) =>
        item &&
        mongoose.Types.ObjectId.isValid(item.productId) &&
        Number.isInteger(Number(item.quantity)) &&
        Number(item.quantity) >= 1
    );

    if (!validItems) {
      return res.status(400).json({
        success: false,
        message: "Order items must include valid productId and quantity",
      });
    }

    if (
      typeof name !== "string" ||
      !name.trim() ||
      typeof mobile !== "string" ||
      !mobile.trim() ||
      typeof address !== "string" ||
      !address.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Name, mobile, and address are required",
      });
    }

    // Fetch product details for all items to save snapshot
    const enrichedItems = [];
    let calculatedTotal = 0;
    
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (product) {
        enrichedItems.push({
          productId: product._id,
          quantity: item.quantity,
          price: product.price,
          name: product.name,
          image: product.image,
        });
        calculatedTotal += product.price * item.quantity;
      } else {
        // If product is missing for some reason during checkout, we reject the order
        return res.status(400).json({
          success: false,
          message: `Product with ID ${item.productId} not found`,
        });
      }
    }

    const order = await Order.create({
      userId,
      items: enrichedItems,
      name: name.trim(),
      mobile: mobile.trim(),
      address: address.trim(),
      totalPrice: calculatedTotal,
    });

    // Clear user's cart after successful order
    await Cart.findOneAndDelete({ userId });

    const populatedOrder = await Order.findById(order._id).populate(
      "items.productId"
    );

    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      order: populatedOrder,
    });
  } catch (error) {
    console.error("Create order error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create order",
    });
  }
};

const getMyOrders = async (req, res) => {
  try {
    const userId = req.user._id;
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const orders = await Order.find({ 
      userId, 
      createdAt: { $gte: sixMonthsAgo } 
    })
      .populate("items.productId")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error("Get my orders error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get orders",
    });
  }
};

const getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ success: false, message: "Invalid order ID" });
    }

    const order = await Order.findById(orderId).populate("items.productId");

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    if (order.userId.toString() !== userId.toString()) {
      return res.status(403).json({ success: false, message: "Unauthorized access to order" });
    }

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    if (order.createdAt < sixMonthsAgo) {
      return res.status(403).json({ success: false, message: "Order is older than 6 months and cannot be viewed" });
    }

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("Get order by ID error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get order details",
    });
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
};