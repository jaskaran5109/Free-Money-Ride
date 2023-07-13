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

module.exports = router;
