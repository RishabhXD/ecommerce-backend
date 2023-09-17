const express = require("express");
const {
  getAllProducts,
  newProduct,
  updateProduct,
  getOneProduct,
  deleteProduct,
  createProductReview,
  getProductReviews,
  deleteReview,
} = require("../controllers/productController");
const { isAuthenticatedUser, authorizedRoles } = require("../middleware/auth");

const router = express.Router();

router.route("/products").get(getAllProducts);
router.route("/product/:id").get(getOneProduct);
router
  .route("/admin/product/new")
  .post(isAuthenticatedUser, authorizedRoles("admin"), newProduct);
router
  .route("/admin/product/:id")
  .patch(isAuthenticatedUser, authorizedRoles("admin"), updateProduct);
router
  .route("/admin/product/:id")
  .delete(isAuthenticatedUser, authorizedRoles("admin"), deleteProduct);

router.route("/review").put(isAuthenticatedUser, createProductReview);
router.route("/review").get(getProductReviews);
router.route("/review").delete(isAuthenticatedUser, deleteReview);

module.exports = router;
