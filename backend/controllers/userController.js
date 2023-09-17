const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const sendToken = require("../utils/jwtToken");
const sendEmail = require("../utils/sendEmail");
const crypto = require("crypto");
const cloudinary = require("cloudinary");

exports.registerUser = async (req, res) => {
  try {
    const myCloud = await cloudinary.v2.uploader.upload(req.body.avatar, {
      folder: "avatar",
      width: 150,
      crop: "scale",
    });
    const { name, email, password } = req.body;
    const cryptPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: cryptPassword,
      avatar: {
        public_id: myCloud.public_id,
        url: myCloud.secure_url,
      },
    });
    await user.save();

    sendToken(user, 201, res);
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({
        success: false,
        message: "Please Enter your email and password",
      });
      return;
    }
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
      return;
    }
    const isPasswordMatched = await bcrypt.compare(password, user.password);
    if (!isPasswordMatched) {
      res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
      return;
    }

    sendToken(user, 200, res);
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Logout
exports.logout = async (req, res) => {
  try {
    res.cookie("token", "", {
      expires: new Date(Date.now()),
      httpOnly: true,
    });
    res.status(200).json({
      success: true,
      message: "Logged Out",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Not Logged Out",
    });
  }
};

// forgot password
exports.forgotPassword = async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    res.status(404).json({
      success: false,
      message: "Email not found",
    });
  }
  try {
    // get reset password token
    const resetToken = user.getPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    const resetPasswordURL = `${req.protocol}://${req.get(
      "Host"
    )}/api/v1/password/reset/${resetToken}`;

    const message = `Click here to reset your password : \n \n ${resetPasswordURL} \n\n If not requested, kindly ignore`;

    await sendEmail({
      email: user.email,
      subject: `Password Recovery`,
      message,
      resetLink: resetPasswordURL,
    });
    res.status(200).json({
      success: true,
      message: `Email sent to ${user.email}`,
    });
  } catch (error) {
    user.resetPasswordExpire = undefined;
    user.resetPasswordToken = undefined;
    await user.save({ validateBeforeSave: false });
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Reset password
exports.resetPassword = async (req, res) => {
  const token = req.params.token;
  try {
    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });
    if (!user) {
      res.status(400).json({
        success: false,
        message: "Reset Token Expired or Invalid",
      });
    }

    if (req.body.password !== req.body.confirmPassword) {
      res.status(400).json({
        success: false,
        message: "Password incorrect",
      });
    }

    user.password = await bcrypt.hash(req.body.password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    sendToken(user, 200, res);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get user details
exports.getUserDetails = async (req, res) => {
  const id = req.user.id;
  try {
    const user = await User.findById(id);
    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Update Password
exports.updatePassword = async (req, res) => {
  const id = req.user.id;
  try {
    const user = await User.findById(id).select("+password");
    const isPasswordMatched = await bcrypt.compare(
      req.body.oldPassword,
      user.password
    );

    if (!isPasswordMatched) {
      res.status(401).json({
        success: false,
        message: "Incorrect old password",
      });
      return;
    }
    if (req.body.newPassword !== req.body.confirmPassword) {
      res.status(400).json({
        success: false,
        message: "Confirm Password incorrect",
      });
      return;
    }
    user.password = await bcrypt.hash(req.body.newPassword, 10);

    await user.save();

    sendToken(user, 200, res);
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Update Profile
exports.updateProfile = async (req, res) => {
  const id = req.user.id;
  const newUserData = { name: req.body.name, email: req.body.email };
  try {
    const user = await User.findByIdAndUpdate(id, newUserData);
    await user.save();
    res.status(200).json({
      success: true,
      user,
    });

    sendToken(user, 200, res);
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Get all users -> Admin

exports.getAllUser = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Get user details -> Admin
exports.getSingleUser = async (req, res) => {
  const id = req.params.id;
  try {
    const user = await User.findById(id);
    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Update User role -> Admin
exports.updateProfileRole = async (req, res) => {
  const id = req.params.id;
  const newUserData = {
    name: req.body.name,
    email: req.body.email,
    role: req.body.role,
  };
  try {
    const user = await User.findByIdAndUpdate(id, newUserData);
    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    await user.save();
    res.status(200).json({
      success: true,
      user,
    });

    sendToken(user, 200, res);
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete User -> Admin
exports.deleteProfile = async (req, res) => {
  const id = req.params.id;
  try {
    const user = await User.findByIdAndDelete(id);
    res.status(200).json({
      success: true,
      user,
    });

    sendToken(user, 200, res);
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
