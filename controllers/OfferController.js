const Offer = require("../models/Offer");
const moment = require("moment");
const UserTransaction = require("../models/UserTransaction");

// Create a new offer
const createOffer = async (req, res) => {
  try {
    const {
      offerName,
      landingPage,
      logo,
      coverImage,
      offerLink,
      po,
      appDescription,
      task,
      geo,
      externalId,
      advertiser,
      isEnabled,
      isShopping,
      os,
      conversionLimit,
      expiryDate,
    } = req.body;
    const offer = new Offer({
      offerName,
      landingPage,
      logo,
      coverImage,
      offerLink,
      po,
      appDescription,
      task,
      geo,
      externalId,
      advertiser,
      isEnabled,
      isShopping,
      os,
      conversionLimit,
      expiryDate,
    });
    await offer.save();
    res.status(201).json({ success: true, Offer: offer });
  } catch (error) {
    res.status(400).json({ success: false, error: "Invalid data" });
  }
};

// Get all offers
const getAllOffers = async (req, res) => {
  try {
    const offers = await Offer.find();
    const currentDate = moment().format("YYYY-MM-DD");

    // Find offers with expiry date equal to current date
    const offer_date = await Offer.find({ expiryDate: currentDate });

    // Update the isEnabled field to false for matched offers
    await Offer.updateMany(
      { _id: { $in: offer_date.map((offer) => offer._id) } },
      { isEnabled: false }
    );

    res.status(200).json({ success: true, Offers: offers });
  } catch (error) {
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

// Get a specific offer by ID
const getOfferById = async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id);
    if (!offer) {
      return res.status(404).json({ success: false, error: "Offer not found" });
    }
    res.status(200).json({ success: true, Offer: offer });
  } catch (error) {
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

// Update an offer by ID
const updateOfferById = async (req, res) => {
  try {
    const offer = await Offer.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!offer) {
      return res.status(404).json({ success: false, error: "Offer not found" });
    }
    res.status(200).json({ success: true, Offer: offer });
  } catch (error) {
    res.status(400).json({ success: false, error: "Invalid data" });
  }
};

// Delete an offer by ID
const deleteOfferById = async (req, res) => {
  try {
    const offer = await Offer.findByIdAndRemove(req.params.id);
    if (!offer) {
      return res.status(404).json({ success: false, error: "Offer not found" });
    }
    res
      .status(200)
      .json({ success: true, message: "Offer deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

const updateOfferStatus = async (req, res) => {
  try {
    res
      .status(200)
      .json({ success: true, message: "Offer status updated successfully." });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, error: `Error updating offer status: ${error}` });
  }
};

const getValidAppOffers = async (req, res) => {
  const { userId } = req.body;

  try {
    const userTransactionOffers = await UserTransaction.find({
      userId,
    }).distinct("offerId");
    const appOffers = await Offer.find({
      isEnabled: true,
      isShopping:false,
      externalId: { $nin: userTransactionOffers },
    });
    if (appOffers.length > 0) {
      res.status(200).json({ success: true, appOffers });
    } else {
      res
        .status(200)
        .json({ success: true, message: "No Active App Offers Found" });
    }
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Error retrieving App offers" });
  }
};

const getValidShoppingOffers = async (req, res) => {
  const { userId } = req.body;

  try {
    const userTransactionOffers = await UserTransaction.find({
      userId,
    }).distinct("offerId");
    const shoppingOffers = await Offer.find({
      isShopping: true,
      isEnabled: true,
      externalId: { $nin: userTransactionOffers },
    });
    if (shoppingOffers.length > 0) {
      res.status(200).json({ success: true, shoppingOffers });
    } else {
      res
        .status(200)
        .json({ success: true, message: "No Active Shopping Offers Found" });
    }
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Error retrieving shopping offers" });
  }
};

module.exports = {
  getAllOffers,
  createOffer,
  getOfferById,
  updateOfferById,
  deleteOfferById,
  updateOfferStatus,
  getValidAppOffers,
  getValidShoppingOffers,
};
