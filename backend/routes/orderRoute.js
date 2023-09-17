const express = require("express");
const { isAuthenticatedUser, authorizedRoles } = require("../middleware/auth");
const {
  newOrder,
  getSingleOrder,
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
  deleteOrder,
} = require("../controllers/orderController");
const router = express.Router();

router.route("/order/new").post(isAuthenticatedUser, newOrder);
router.route("/order/:id").get(isAuthenticatedUser, getSingleOrder);
router.route("/orders/me").get(isAuthenticatedUser, getMyOrders);
router
  .route("/orders/admin")
  .get(isAuthenticatedUser, authorizedRoles("admin"), getAllOrders);
router
  .route("/order/status/:id")
  .put(isAuthenticatedUser, authorizedRoles("admin"), updateOrderStatus);
router
  .route("/order/:id")
  .delete(isAuthenticatedUser, authorizedRoles("admin"), deleteOrder);
module.exports = router;
