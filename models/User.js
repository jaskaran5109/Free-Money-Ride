const mongoose = require("mongoose");
const validator = require("validator");
const moment = require("moment");
const jwt = require("jsonwebtoken");

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please enter your name"],
  },
  email: {
    type: String,
    required: [true, "Please enter your email"],
    unique: true,
    validate: validator.isEmail,
  },
  phoneNumber: {
    type: String,
    required: [true, "Please enter your phone number"],
    unique: true,
  },
  dateOfBirth: {
    type: String,
    default: moment().format("YYYY-MM-DD"),
  },
  gender: {
    type: String,
    required: [true, "Please enter a gender"],
    default: "male",
  },
  wallet: {
    amount: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  razorpayContactId: {
    type: String,
  },
  razorpayFundId: {
    type: String,
  },
  razorpayPayoutId: {
    type: String,
  },
  razorpayPayoutStatus: {
    type: String,
  },
  razorpayStatusDetails: {
    reason: {
      type: String,
      default: null,
    },
    description: {
      type: String,
      default: null,
    },
    source: {
      type: String,
      default: null,
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

UserSchema.methods.getJWTAppToken = function () {
  return jwt.sign({ _id: this._id }, "secret2", {
    expiresIn: "15d",
  });
};

const User = mongoose.model("User", UserSchema);

module.exports = User;
