const Order = require("../models/order.model.js");
const Cart = require("../models/cart.model.js");

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

    if (
      !userId ||
      !items ||
      items.length === 0 ||
      !name ||
      !mobile ||
      !address ||
      totalPrice === undefined
    ) {
      return res.status(400).json({
        success: false,
        message: "All order details are required",
      });
    }

    const order = await Order.create({
      userId,
      items,
      name,
      mobile,
      address,
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