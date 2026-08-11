const Order = require("../models/order.model.js");
const Cart = require("../models/cart.model.js");
const mongoose = require("mongoose");

const createOrder = async (req, res) => {
  try {
    const {
      userId,
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

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "A valid userId is required",
      });
    }

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
      !address.trim() ||
      typeof totalPrice !== "number" ||
      !Number.isFinite(totalPrice) ||
      totalPrice < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Name, mobile, address, and a valid totalPrice are required",
      });
    }

    const order = await Order.create({
      userId,
      items,
      name: name.trim(),
      mobile: mobile.trim(),
      address: address.trim(),
      totalPrice,
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
      error: error.message,
    });
  }
};

const getUserOrders = async (req, res) => {
  try {
    const { userId } = req.params;

    const orders = await Order.find({ userId })
      .populate("items.productId")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get orders",
      error: error.message,
    });
  }
};

module.exports = {
  createOrder,
  getUserOrders,
};