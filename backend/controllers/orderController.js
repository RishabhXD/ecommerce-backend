const Order = require("../models/orderModel");
const Product = require("../models/productModel");

exports.newOrder = async (req, res) => {
  try {
    const {
      shippingInfo,
      orderItem,
      paymentInfo,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
      orderStatus,
    } = req.body;
    const order = await Order.create({
      shippingInfo,
      orderItem,
      paymentInfo,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
      orderStatus,
      paidAt: Date.now(),
      user: req.user._id,
    });

    res.status(201).json({
      success: true,
      order,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getSingleOrder = async (req, res) => {
  try {
    const id = req.params.id;

    const order = await Order.findById(id).populate("user", "name email");
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error,
    });
  }
};

exports.getMyOrders = async (req, res) => {
  try {
    const order = await Order.find({ user: req.user._id });
    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error,
    });
  }
};

exports.getAllOrders = async (req, res) => {
  try {
    const order = await Order.find();

    let totalAmount = 0;
    order.forEach((order) => {
      totalAmount += order.totalPrice;
    });
    res.status(200).json({
      success: true,
      order,
      totalAmount,
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};

// Admin

exports.updateOrderStatus = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (order.orderStatus == "Delivered") {
      return res.status(400).json({
        success: false,
        message: "Order Already Complete",
      });
    }
    if (order.orderStatus == "Shipped") {
      order.orderItem.forEach(async (item) => {
        await updateStock(item.product, item.quantity);
      });
    }

    order.orderStatus = req.body.status;
    if (req.body.status == "Delivered") {
      order.deliveredAt = Date.now();
    }
    await order.save();
    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};

const updateStock = async (id, quantity) => {
  const product = await Product.findById(id);
  product.stock -= quantity;

  await product.save();
};

// Admin
        
exports.deleteOrder = async (req, res) => {
  const id = req.params.id;
  const order = await Order.findById(id).populate("user", "name email");
  if (!order) {
    return res.status(404).json({
      success: false,
      message: "Product not found",
    });
  }

  await Order.findByIdAndDelete(id);
  res.status(200).json({
    success: true,
    message: "Order deleted successfully",
  });
};
