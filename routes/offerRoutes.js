const express = require("express");
const router = express.Router();
const offerController = require("../controllers/OfferController");

// Route for getting all offers
router.get("/admin/offers", offerController.getAllOffers);

router.post("/admin/appoffers", offerController.getValidAppOffers);

router.post("/admin/shoppingoffers", offerController.getValidShoppingOffers);

// Route for creating a new offer
router.post("/admin/offer", offerController.createOffer);

// Route for getting a specific offer by ID
router.get("/admin/offer/:id", offerController.getOfferById);

// Route for updating an offer by ID
router.put("/admin/offer/:id", offerController.updateOfferById);

// Route for deleting an offer by ID
router.delete("/admin/offer/:id", offerController.deleteOfferById);

module.exports = router;
