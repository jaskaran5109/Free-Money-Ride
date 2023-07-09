const express = require("express");
const router = express.Router();
const pushbackController = require("../controllers/PushbackController");
const { isAppAuthenticated } = require("../middlewares/auth");

// Route for getting report of User througt offer ID
router.post("/pushBackReport",pushbackController.getReports);

router.post("/pushBackReportWithDates",pushbackController.getReportsForDates);

module.exports = router;
