const express = require("express");
const router = express.Router();
const userTransactionController = require("../controllers/UserTransactionController");

// Route for creating a new user transaction
router.post(
  "/user-transaction",
  userTransactionController.createUserTransaction
);

// Route for getting a specific user transaction by ID
router.post(
  "/single-user-transaction",
  userTransactionController.getSingleUserTransactionById
);

module.exports = router;
