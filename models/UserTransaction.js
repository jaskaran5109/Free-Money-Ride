const mongoose = require("mongoose");

const userTransactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },
  offerId:{
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  currency: {
    type: String,
    required: true,
    default: "INR",
  },
  description: {
    type: String,
    required: true,
  },
  transactionDate: {
    type: Date,
    default: Date.now,
  },
});


userTransactionSchema.index({ userId: 1, offerId: 1 }, { unique: true });

const UserTransaction = mongoose.model(
  "UserTransaction",
  userTransactionSchema
);

module.exports = UserTransaction;
