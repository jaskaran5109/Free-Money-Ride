const express = require("express");
const router = express.Router();
const userController = require("../controllers/UserController");
const {
  isAppAuthenticated,
  isAuthenticated,
  authorizedAdmin,
} = require("../middlewares/auth");

router.post("/register", userController.register);
router.post("/login", userController.login);
router.post("/logout", userController.logout);
router.post("/phoneCheck", userController.phoneCheck);
router.get("/me", isAppAuthenticated, userController.getMyProfile);
router.get("/admin/getAllUsers", isAuthenticated, userController.getAllUsers);
router.delete(
  "admin/user/:id",
  isAuthenticated,
  authorizedAdmin,
  userController.deleteUserById
);
router.put("/user/wallet", isAppAuthenticated, userController.updateUserWallet);
router.post(
  "/user/addFundId",
  isAppAuthenticated,
  userController.addRazorPayFundId
);

router.post(
  "/user/payout",
  isAppAuthenticated,
  userController.createPayout
);

router.put(
  "/user/payout",
  isAppAuthenticated,
  userController.updatePayoutStatus
);


router.post("/forgetpassword",userController.forgetPassword);
router.put("/admin/resetpassword/:token",userController.resetPassword);


router.post('/device-token', userController.addDeviceToken);
router.post('/send-notifications',isAuthenticated, userController.sendNotificationsToAll);

module.exports = router;
