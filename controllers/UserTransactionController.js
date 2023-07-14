const catchAsyncError = require("../middlewares/catchAsyncError");
const User = require("../models/User");
const UserTransaction = require("../models/UserTransaction");

// Create a new user transaction
const createUserTransaction = async (req, res) => {
  const { userId, offerId, amount, currency, description } = req.body;

  const existingOffer = await UserTransaction.findOne({
    offerId: offerId,
    userId: userId,
  });
  const user = await User.findById(userId);
  if (existingOffer) {
    return res.status(200).json({});
  }

  user.wallet.amount += amount;
  const earning = new UserTransaction({
    userId,
    offerId,
    amount,
    currency,
    description,
  });

  try {
    await earning.save();
    await user.save();
    return res.status(201).json({ success: true, earning });
  } catch (error) {
    return res
      .status(500)
      .json({ error: "An error occurred while saving the transaction." });
  }
};

// Get a specific user transaction by ID
const getSingleUserTransactionById = async (req, res) => {
  const { userId } = req.body;
  try {
    const earnings = await UserTransaction.find({ userId: userId });

    if (!earnings) {
      return res.status(404).json({
        success: false,
        error: "You have not yet completed any tasks.",
      });
    }

    res.json({ success: true, earnings });
  } catch (error) {
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

const getAllUsersEarnings = async (req, res) => {
  try {
    const result = await UserTransaction.aggregate([
      {
        $group: {
          _id: null,
          totalEarnings: { $sum: "$amount" },
        },
      },
    ]);

    const totalEarnings = result[0].totalEarnings;
    res.json({ success: true, totalEarnings });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, error: "Error calculating total earnings" });
  }
};

const findTotalEarningsByDate = async (req, res) => {
  try {
    const { date } = req.body; // Assuming the date is passed in the request body

    // Create a query object with the default filter for today's date
    let query = {};

    // If a date is provided in the request body, update the query object accordingly
    if (date) {
      const selectedDate = new Date(date);
      const startDate = new Date(selectedDate.setUTCHours(0, 0, 0, 0));
      const endDate = new Date(selectedDate.setUTCHours(23, 59, 59, 999));

      query = {
        transactionDate: {
          $gte: startDate,
          $lt: endDate,
        },
      };
    } else {
      // If no date is provided, calculate earnings for today's date
      const today = new Date();
      const startDate = new Date(today.setUTCHours(0, 0, 0, 0));
      const endDate = new Date(today.setUTCHours(23, 59, 59, 999));

      query = {
        transactionDate: {
          $gte: startDate,
          $lt: endDate,
        },
      };
    }

    // Use the aggregate function of Mongoose to calculate the sum of earnings
    const result = await UserTransaction.aggregate([
      {
        $match: query,
      },
      {
        $group: {
          _id: null,
          totalEarnings: { $sum: "$amount" },
        },
      },
    ]);

    // Check if any results are returned
    if (result.length > 0) {
      const totalEarnings = result[0].totalEarnings;
      res.status(200).json({ totalEarnings });
    } else {
      res
        .status(404)
        .json({ message: "No earnings found for the specified date." });
    }
  } catch (error) {
    res.status(500).json({ message: "Error finding total earnings." });
  }
};

const findTotalUsersAmountLeft = async (req, res) => {
  try {
    // Use the aggregate function of Mongoose to calculate the sum of wallet amounts
    const result = await User.aggregate([
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$wallet.amount" },
        },
      },
    ]);

    if (result.length > 0) {
      const totalAmount = result[0].totalAmount;
      res.json({ success: true, totalAmount });
    } else {
      res.json({ success: true, message: "No Amount Found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error finding total amounts" });
  }
};

module.exports = {
  createUserTransaction,
  getSingleUserTransactionById,
  getAllUsersEarnings,
  findTotalEarningsByDate,
  findTotalUsersAmountLeft,
};
