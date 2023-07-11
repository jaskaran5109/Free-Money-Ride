const User = require("../models/User");
const base64 = require("base-64");
const axios = require("axios");
const ErrorHandler = require("../services/errorHandler.js");
const catchAsyncError = require("../middlewares/catchAsyncError");

const { sendAppToken } = require("../services/sendToken");

exports.register = catchAsyncError(async (req, res) => {
  const { name, email,password, phoneNumber, gender, dateOfBirth } = req.body;

  // Check if user already exists

  if (!name || !email || !password || !phoneNumber || !gender || !dateOfBirth) {
    return next(new ErrorHandler("Please enter a All fields", 400));
  }

  const existingUser = await User.findOne({ email, phoneNumber });
  if (existingUser) {
    return next(new ErrorHandler("User already exists", 400));
  }

  // Create a new user
  const user = new User({ name, email,password, phoneNumber, gender, dateOfBirth });

  const razorpayContact = await axios.post(
    "https://api.razorpay.com/v1/contacts",
    {
      name,
      email,
      contact: phoneNumber,
      type: "customer",
    },
    {
      headers: {
        Authorization: `Basic ${base64.encode(
          `${process.env.RAZORPAY_API_KEY}:${process.env.RAZORPAY_API_SECRET}`
        )}`,
        "Content-Type": "application/json",
      },
    }
  );

  user.razorpayContactId = razorpayContact.data.id;
  await user.save();

  // Send the response
  sendAppToken(res, user, "Registered Successfully", 201);
});

exports.login = catchAsyncError(async (req, res) => {
  const { phoneNumber, password } = req.body;

  if (!phoneNumber || !password)
    return res.status(400).json({ error: "Please enter all fields" });

  const user = await User.findOne({ phoneNumber }).select("+password");

  if (!user)
    return res.status(401).json({ error: "Incorrect phoneNumber or Password" });

  const isMatch = await user.comparePassword(password);

  if (!isMatch)
    return res.status(401).json({ error: "Incorrect phoneNumber or Password" });
    
  sendAppToken(res, user, `Welcome back, ${user.name}`, 200);
});

exports.phoneCheck = async (req, res) => {
  const { phoneNumber } = req.body;
  try {
    const user = await User.findOne({ phoneNumber: phoneNumber });
    if (user) {
      return res.status(200).json({ success: true, message: "User Exist" });
    }
    res.status(200).json({
      success: true,
      message: "User Does Not Exist",
    });
  } catch (error) {
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

exports.logout = catchAsyncError((req, res) => {
  res
    .status(200)
    .cookie("apptoken", null, {
      expires: new Date(Date.now()),
      httpOnly: true,
      secure: true,
      sameSize: "none",
    })
    .json({
      success: true,
      message: "Logged Out Successfully",
    });
});

exports.getMyProfile = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.user?._id);
  res.status(200).json({
    success: true,
    user,
  });
});

exports.getAllUsers = catchAsyncError(async (req, res) => {
  const user = await User.find();
  res.status(200).json({ success: true, user: user });
});

exports.deleteUserById = catchAsyncError(async (req, res) => {
  const user = await User.findByIdAndRemove(req.params.id);
  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }
  res.status(200).json({ success: true, message: "User deleted successfully" });
});

exports.updateUserWallet = catchAsyncError(async (req, res) => {
  const { userId, amount } = req.body;
  const user = await User.findById(userId);
  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }

  user.wallet.amount += amount;
  await user.save();
  res.status(200).json({
    success: true,
    message: "Wallet Updated Successfully!",
    user: user,
  });
});

exports.addRazorPayFundId = catchAsyncError(async (req, res) => {
  const { userId, contactId, api } = req.body;
  // Find the user by their ID
  const user = await User.findById(userId);
  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }
  try {
    // await user.save();

    const razorpayFundId = await axios.post(
      "https://api.razorpay.com/v1/fund_accounts",
      {
        contact_id: contactId,
        account_type: "vpa",
        vpa: {
          address: `${api}`,
        },
      },
      {
        headers: {
          Authorization: `Basic ${base64.encode(
            `${process.env.RAZORPAY_API_KEY}:${process.env.RAZORPAY_API_SECRET}`
          )}`,
          "Content-Type": "application/json",
        },
      }
    );

    user.razorpayFundId = razorpayFundId.data.id;
    await user.save();

    res.status(200).json({
      success: true,
      message: "RazorpayFundId Added Successfully!",
      user: user,
    });
  } catch (error) {
    next(new ErrorHandler("Failed to add Fund ID", 500));
  }
});

exports.createPayout = catchAsyncError(async (req, res) => {
  const { userId, fundId, amount } = req.body;
  // Find the user by their ID
  const user = await User.findById(userId);
  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }
  try {
    // await user.save();

    const razorpayPayoutId = await axios.post(
      "https://api.razorpay.com/v1/payouts",
      {
        account_number: process.env.ACCOUNT_NUMBER,
        fund_account_id: fundId,
        amount: amount * 100,
        currency: "INR",
        mode: "UPI",
        purpose: "refund",
        queue_if_low_balance: true,
      },
      {
        headers: {
          Authorization: `Basic ${base64.encode(
            `${process.env.RAZORPAY_API_KEY}:${process.env.RAZORPAY_API_SECRET}`
          )}`,
          "Content-Type": "application/json",
        },
      }
    );
    user.razorpayPayoutId = razorpayPayoutId.data.id;
    user.razorpayPayoutStatus = razorpayPayoutId.data.status;
    if (razorpayPayoutId.data.status === "queued") {
      user.razorpayPayoutStatus = "cancelled";
      user.razorpayStatusDetails.reason = null;
      user.razorpayStatusDetails.description = null;
      user.razorpayStatusDetails.source = null;
    } else {
      if (razorpayPayoutId.data.status === "processing") {
        user.wallet.amount = user.wallet.amount - amount;
        user.razorpayStatusDetails.reason =
          razorpayPayoutId.data.status_details.reason;
        user.razorpayStatusDetails.description =
          razorpayPayoutId.data.status_details.description;
        user.razorpayStatusDetails.source =
          razorpayPayoutId.data.status_details.source;
      }
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: "RazorpayPayout Added Successfully!",
      user: user,
    });
  } catch (error) {
    next(new ErrorHandler("Failed to create Payout ID", 500));
  }
});

exports.updatePayoutStatus = catchAsyncError(async (req, res) => {
  const { userId, payoutId } = req.body;
  // Find the user by their ID
  const user = await User.findById(userId);
  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }
  try {
    const razorpayPayoutId = await axios.get(
      `https://api.razorpay.com/v1/payouts/${payoutId}`,
      {
        headers: {
          Authorization: `Basic ${base64.encode(
            `${process.env.RAZORPAY_API_KEY}:${process.env.RAZORPAY_API_SECRET}`
          )}`,
        },
      }
    );

    user.razorpayPayoutStatus = razorpayPayoutId.data.status;
    user.razorpayStatusDetails.reason =
      razorpayPayoutId.data.status_details.reason;
    user.razorpayStatusDetails.description =
      razorpayPayoutId.data.status_details.description;
    user.razorpayStatusDetails.source =
      razorpayPayoutId.data.status_details.source;
    await user.save();

    res.status(200).json({
      success: true,
      message: "RazorpayPayout Status Successfully!",
      user: user,
    });
  } catch (error) {
    next(new ErrorHandler("Failed to update Payout status", 500));
  }
});
