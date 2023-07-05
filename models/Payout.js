const mongoose = require("mongoose");

const payoutSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  payoutDate: {
    type: Date,
    default: Date.now,
  },
});

const UserPayout = mongoose.model("UserPayouts", payoutSchema);

module.exports = UserPayout;
