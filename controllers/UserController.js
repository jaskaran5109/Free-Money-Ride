const User = require("../models/User");
const base64 = require("base-64");
const axios = require("axios");
const catchAsyncError = require("../middlewares/catchAsyncError");

const { sendAppToken } = require("../services/sendToken");

exports.register = async (req, res,next) => {
  const { name, email,password, phoneNumber, gender, dateOfBirth } = req.body;

  // Check if user already exists

  if (!name || !email || !password || !phoneNumber || !gender || !dateOfBirth) {
    return res.status(400).json({ error: "Please enter all fields" });
  }

  const existingUser = await User.findOne({ phoneNumber });
  if (existingUser) {
    return res.status(409).json({ error: "User already exists" });
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
};

exports.login = async (req, res) => {
  const { phoneNumber, password } = req.body;
try {
  if (!phoneNumber || !password)
    return res.status(400).json({ error: "Please enter all fields" });

  const user = await User.findOne({ phoneNumber }).select("+password");

  if (!user)
    return res.status(401).json({success:false, error: "User not found! Please Register" });

  const isMatch = await user.comparePassword(password);

  if (!isMatch)
    return res.status(400).json({success:false, error: "Incorrect Password" });
    
  sendAppToken(res, user, `Welcome back, ${user.name}`, 200);

  } catch (error) {
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

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
    return res.status(404).json({ error: "User not found" });
  }
  res.status(200).json({ success: true, message: "User deleted successfully" });
});

exports.updateUserWallet = catchAsyncError(async (req, res) => {
  const { userId, amount } = req.body;
  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({ error: "User not found" });
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
    return res.status(404).json({ error: "User not found" });
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
    res.status(500).json({ error: "Failed to add Fund ID" });
  }
});

exports.createPayout = catchAsyncError(async (req, res) => {
  const { userId, fundId, amount } = req.body;
  // Find the user by their ID
  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({ error: "User not found" });
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
    res.status(500).json({ error: "Failed to create Payout ID" });
  }
});

exports.updatePayoutStatus = catchAsyncError(async (req, res) => {
  const { userId, payoutId } = req.body;
  // Find the user by their ID
  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({ error: "User not found" });
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
    res.status(500).json({ error: "Failed to update Payout status" });
  }
});
