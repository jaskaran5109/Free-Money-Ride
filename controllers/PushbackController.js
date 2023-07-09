const catchAsyncError = require("../middlewares/catchAsyncError");
const axios = require("axios");

exports.getReports = catchAsyncError(async (req, res) => {
  const { offer, aff_sub2 } = req.body;

  const { data } = await axios.get(
    `https://api.offer18.com/api/af/report?key=${process.env.OFFER18_API_KEY}&mid=${process.env.OFFER18_MID}&aid=${process.env.OFFER18_AID}&fields=clicks,affiliate_price,conversion,offer_name,aff_sub,offer,aff_sub2,date&offer=${offer}&aff_sub2=${aff_sub2}`
  );

  res.status(200).json({
    success: true,
    reports: data.reports,
  });
});


exports.getReportsForDates = catchAsyncError(async (req, res) => {
  const { startDate, endDate, offer, aff_sub2 } = req.body;

  const { data } = await axios.get(
    `https://api.offer18.com/api/af/report?date_from=${startDate}&date_end=${endDate}&key=${process.env.OFFER18_API_KEY}&mid=${process.env.OFFER18_MID}&aid=${process.env.OFFER18_AID}&fields=clicks,conversion,offer_name,aff_sub,offer,aff_sub2,date&offer=${offer}&aff_sub2=${aff_sub2}`
  );

  res.status(200).json({
    success: true,
    reports: data.reports,
  });
});
