const Product = require("../models/productModel");
const ApiFeature = require("../utils/apiFeatures");

// Create new product => /api/v1/product/new -- Admin Route
exports.newProduct = async (req, res) => {
  try {
    console.log(req.user);
    req.body.user = req.user.id;
    const product = await Product.create(req.body);
    await product.save();
    res.status(201).json({
      success: true,
      product,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Get all products => /api/v1/products
exports.getAllProducts = async (req, res) => {
  try {
    const resultPerPage = 9;
    const productCount = await Product.countDocuments();
    const apiFeature = new ApiFeature(Product.find(), req.query)
      .search()
      .filter()
      .pagination(resultPerPage);
    const products = await apiFeature.query;
    res.status(200).json({
      success: true,
      productCount,
      products,
      resultPerPage,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Get one products => /api/v1/product/:id
exports.getOneProduct = async (req, res) => {
  const id = req.params.id;
  try {
    const product = await Product.findById(id);
    res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Update Product -- Admin Route => /api/v1/product/:id
exports.updateProduct = async (req, res) => {
  const id = req.params.id;
  let product = await Product.findById(id);
  if (!product) {
    return res.status(404).json({
      success: false,
      message: "Product not found",
    });
  }
  try {
    product = await Product.findByIdAndUpdate(id, { ...req.body });
    res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete Product -- Admin Route => /api/v1/product/:id
exports.deleteProduct = async (req, res) => {
  const id = req.params.id;
  let product = await Product.findById(id);
  if (!product) {
    return res.status(404).json({
      success: false,
      message: "Product not found",
    });
  }
  try {
    product = await Product.findByIdAndDelete(id);
    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
      product,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Create/Update Review

exports.createProductReview = async (req, res) => {
  try {
    const { rating, comment, productID } = req.body;
    const review = {
      user: req.user._id,
      name: req.user.name,
      rating: Number(rating),
      comment,
    };

    const product = await Product.findById(productID);
    const isReviewed = product.reviews.find(
      (rev) => rev.user.toString() === req.user._id.toString()
    );
    console.log(isReviewed);
    if (isReviewed) {
      product.reviews.forEach((rev) => {
        rev.rating = Number(rating);
        rev.comment = comment;
      });
    } else {
      product.reviews.push(review);
      product.numberOfReviews = product.reviews.length;
    }
    let totalRating = 0;
    product.reviews.forEach((rev) => {
      totalRating += rev.rating;
    });

    product.rating = Number(totalRating / product.reviews.length);
    await product.save();
    res.status(200).json({
      success: true,
      message: "Review Added successfully",
      product,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Get All Reviews
exports.getProductReviews = async (req, res) => {
  try {
    const product = await Product.findById(req.query.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      reviews: product.reviews,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete Review
exports.deleteReview = async (req, res) => {
  try {
    const id = req.query.id;
    const productID = req.query.productID;
    console.log(id, productID);
    const product = await Product.findById(productID);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const reviews = product.reviews.filter(
      (rev) => rev._id.toString() !== id.toString()
    );

    let totalRating = 0;
    reviews.forEach((rev) => {
      totalRating += rev.rating;
    });

    const rating = Number(totalRating / reviews.length);
    const numberOfReviews = reviews.length;

    await Product.findByIdAndUpdate(productID, {
      reviews: reviews,
      rating: rating,
      numberOfReviews: numberOfReviews,
    });
    product.save();
    res.status(200).json({
      success: true,
      message: "Review deleted successfully",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error,
    });
  }
};
