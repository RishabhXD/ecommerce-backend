const express = require("express");
const {
  registerUser,
  loginUser,
  forgotPassword,
  logout,
  resetPassword,
  getUserDetails,
  updatePassword,
  updateProfile,
  getAllUser,
  getSingleUser,
  updateProfileRole,
  deleteProfile,
} = require("../controllers/userController");
const { isAuthenticatedUser, authorizedRoles } = require("../middleware/auth");

const router = express.Router();

router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/password/forgot").post(forgotPassword);
router.route("/password/reset/:token").post(resetPassword);
router.route("/me").get(isAuthenticatedUser, getUserDetails);
router.route("/password/update").put(isAuthenticatedUser, updatePassword);
router.route("/me/update").put(isAuthenticatedUser, updateProfile);
router.route("/logout").get(logout);

// Admin
router
  .route("/admin/users")
  .get(isAuthenticatedUser, authorizedRoles("admin"), getAllUser);
router
  .route("/admin/user/:id")
  .get(isAuthenticatedUser, authorizedRoles("admin"), getSingleUser);

router
  .route("/admin/user/:id")
  .put(isAuthenticatedUser, authorizedRoles("admin"), updateProfileRole);

router
  .route("/admin/user/:id")
  .delete(isAuthenticatedUser, authorizedRoles("admin"), deleteProfile);

module.exports = router;
