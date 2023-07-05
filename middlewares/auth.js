const jwt = require("jsonwebtoken");
const AdminUser = require("../models/AdminUser");
const User = require("../models/User");

exports.isAuthenticated = async (req, res, next) => {
  const {token} = req.cookies;

  if (!token) return res.status(401).json({ error: "Not Logged In" });

  const decoded = jwt.verify(token, "secret");

  req.user = await AdminUser.findById(decoded._id);

  next();
};

exports.isAppAuthenticated = async (req, res, next) => {
  const {apptoken} = req.cookies;

  if (!apptoken) return res.status(401).json({ error: "Not Logged In" });

  const decoded = jwt.verify(apptoken, "secret2");

  req.user = await User.findById(decoded._id);

  next();
};

exports.authorizedAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return next(
      res.status(403).json({
        error: `${req.user.role} is not authorized to access this resourse`,
      })
    );
  }
  next();
};
