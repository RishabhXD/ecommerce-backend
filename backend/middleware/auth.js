const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
exports.isAuthenticatedUser = async (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(404).json({
        success: false,
        message: "Please login to access",
      });
    }

    const decodedData = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decodedData.id);
    next();
  } catch (error) {
    console.log(error.message);
  }
};

exports.authorizedRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `${req.user.role} is not authorized`,
      });
    }
    next();
  };
};
