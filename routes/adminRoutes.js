const { authorizedAdmin, isAuthenticated } = require("../middlewares/auth");

const express = require("express");
const adminController = require("../controllers/AdminController");
const router = express.Router();

router.route("/register").post(adminController.register);
router.route("/login").post(adminController.login);
router.route("/logout").post(adminController.logout);

router.route("/me").get(isAuthenticated, adminController.getMyProfile);

router
  .route("/getalladminusers")
  .get(isAuthenticated, authorizedAdmin, adminController.getAllAdminUsers);
router
  .route("/user/:id")
  .put(isAuthenticated, authorizedAdmin, adminController.updateUserRole)
  .delete(isAuthenticated, authorizedAdmin, adminController.deleteUser);

  module.exports = router;