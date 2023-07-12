const catchAsyncError = require("../middlewares/catchAsyncError");
const UserTransaction = require("../models/UserTransaction");

// Create a new user transaction
const createUserTransaction = catchAsyncError(async (req, res) => {
  try {
    const { userId,offerId, amount, currency, description } = req.body;


    const existingOfferId=await UserTransaction.findOne({offerId});
    if(existingOfferId){
      return res.status(201).json({});
    }
    const earning = new UserTransaction({
      userId,
      offerId,
      amount,
      currency,
      description,
    });

    await earning.save();
    res.status(201).json({ success: true, earning });
  } catch (error) {
    res.status(400).json({ success: false, error: "Invalid data" });
  }
});

// Get a specific user transaction by ID
const getSingleUserTransactionById = async (req, res) => {
  const { userId } = req.body;
  try {
    const earnings = await UserTransaction.find({ userId: userId });

    if (!earnings) {
      return res
        .status(404)
        .json({ success: false, error: "You have not yet completed any tasks." });
    }

    res.json({ success: true, earnings });
  } catch (error) {
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

module.exports = {
  createUserTransaction,
  getSingleUserTransactionById,
};
