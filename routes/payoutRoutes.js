const express = require("express");
const router = express.Router();
const payoutController = require("../controllers/PayoutController");
// Route for creating a new user Payout
router.post("/user-payout", payoutController.createUserPayout);

// Route for getting all user Payouts
router.post("/single-user-payouts", payoutController.getSingleUserPayouts);

module.exports = router;
