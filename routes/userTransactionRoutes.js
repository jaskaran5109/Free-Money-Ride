const express = require("express");
const router = express.Router();
const userTransactionController = require("../controllers/UserTransactionController");
const { isAppAuthenticated } = require("../middlewares/auth");

// Route for creating a new user transaction
router.post(
  "/user-transaction",isAppAuthenticated,
  userTransactionController.createUserTransaction
);

// Route for getting a specific user transaction by ID
router.post(
  "/single-user-transaction",isAppAuthenticated,
  userTransactionController.getSingleUserTransactionById
);

router.get("/all-user-earnings",userTransactionController.getAllUsersEarnings)
router.post("/all-user-earnings-for-todays-day",userTransactionController.findTotalEarningsByDate)
router.get("/all-user-amount-left",userTransactionController.findTotalUsersAmountLeft)

module.exports = router;
