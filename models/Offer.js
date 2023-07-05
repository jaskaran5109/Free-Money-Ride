const mongoose = require("mongoose");
const moment=require("moment");

const offerSchema = new mongoose.Schema({
  offerName: {
    type: String,
    required: true,
  },
  landingPage: {
    type: String,
    required: true,
  },
  logo: {
    type: String,
    required: true,
  },
  coverImage: {
    type: String,
    required: true,
  },
  offerLink: {
    type: String,
    required: true,
  },
  po: {
    type: Number,
    required: true,
  },
  appDescription: {
    type: String,
    required: true,
  },
  task: {
    type: String,
    required: true,
  },
  geo: {
    type: String,
    required: true,
  },
  externalId: {
    type: String,
    required: true,
  },
  advertiser: {
    type: String,
    required: true,
  },
  isEnabled: {
    type: Boolean,
    default: true,
  },
  os: {
    type: String,
    enum: ["Android", "Iphone","Ipad","Windows Phone"],
    required: true,
  },
  expiryDate: {
    type: String,
    default: moment().format('YYYY-MM-DD'),
  },
  conversionLimit:{
    type: Number,
    default:10,
    required:true,
  }
});

const Offer = mongoose.model("Offer", offerSchema);

module.exports = Offer;
