const mongoose = require("mongoose");
const validator = require("validator");
const moment = require("moment");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const crypto = require('crypto');

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
  password: {
    type: String,
    required: [true, "Please enter your password"],
    minLength: [6, "Password must be at least 6 characters"],
    select: false,
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
  deviceToken: {
    type: String,
    unique: true,
  },
  resetPasswordToken: String,
  resetPasswordExpire: String,
});

UserSchema.methods.getJWTAppToken = function () {
  return jwt.sign({ _id: this._id }, "secret2", {
    expiresIn: "15d",
  });
};

UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

UserSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

UserSchema.methods.getResetToken = function () {
  const resetToken = crypto.randomBytes(20).toString("hex");
  this.resetPasswordToken = crypto
  .createHash('sha256')
  .update(resetToken)
  .digest('hex');
  this.resetPasswordExpire = Date.now() + 15 * 60 * 1000;
  return resetToken;
};

const User = mongoose.model("User", UserSchema);

module.exports = User;
