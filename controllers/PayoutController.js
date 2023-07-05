const catchAsyncError = require("../middlewares/catchAsyncError");
const UserPayout = require("../models/Payout");

// Create a new user transaction
const createUserPayout = catchAsyncError(async (req, res) => {
  const { userId, amount, description } = req.body;

  const userPayout = new UserPayout({
    userId,
    amount,
    description,
  });

  await userPayout.save();
  res.status(201).json({ success: true, payout: userPayout });
});

// Get all user transactions
const getSingleUserPayouts = catchAsyncError(async (req, res) => {
  const { userId } = req.body;
  const payouts = await UserPayout.find({ userId });
  if (!payouts) {
    return res.json({ success: true, message: "You don't have any Payouts" });
  }
  res.json({ success: true, payouts });
});

module.exports = {
  createUserPayout,
  getSingleUserPayouts,
};
