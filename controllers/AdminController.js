const AdminUser = require("../models/AdminUser");
const {  sendToken } = require("../services/sendToken");

exports.register = async (req, res, next) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: "Please enter all fields" });
  }
  let user = await AdminUser.findOne({ email });
  if (user) {
    return res.status(409).json({ error: "User already exists" });
  }
  user = await AdminUser.create({
    name,
    email,
    password,
  });
  sendToken(res, user, "Registered Successfully", 201);
};

exports.login = async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ error: "Please enter all fields" });

  const user = await AdminUser.findOne({ email }).select("+password");

  if (!user)
    return res.status(401).json({ error: "Incorrect Email or Password" });

  const isMatch = await user.comparePassword(password);

  if (!isMatch)
    return res.status(401).json({ error: "Incorrect Email or Password" });

  sendToken(res, user, `Welcome back, ${user.name}`, 200);
};

exports.logout = async (req, res, next) => {
  res
    .status(200)
    .cookie("token", null, {
      expires: new Date(Date.now()),
      httpOnly: true,
      secure: true,
      sameSize: "none",
    })
    .json({
      success: true,
      message: "Logged Out Successfully",
    });
};

exports.getMyProfile = async (req, res, next) => {
  const user = await AdminUser.findById(req.user._id);
  res.status(200).json({
    success: true,
    user,
  });
};

exports.getAllAdminUsers = async (req, res, next) => {
  const users = await AdminUser.find();
  res.status(200).json({
    success: true,
    users,
  });
};

exports.updateUserRole = async (req, res, next) => {
  const user = await AdminUser.findById(req.params.id);
  if (!user) {
    return res.status(404).json({ error: "User Not Found" });
  }
  if (user.role === "user") {
    user.role = "admin";
  } else if (user.role === "admin") {
    user.role = "user";
  }
  await user.save();
  res.status(200).json({
    success: true,
    message: "Role Updated successfully",
  });
};

exports.deleteUser = async (req, res, next) => {
  const user = await AdminUser.findById(req.params.id);
  if (!user) {
    return res.status(404).json({ error: "User Not Found" });
  }
  await user.deleteOne();
  res.status(200).json({
    success: true,
    message: "User Deleted successfully",
  });
};
