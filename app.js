require("dotenv").config();
const express = require("express");
const userRoutes = require("./routes/userRoutes");
const offerRoutes = require("./routes/offerRoutes");
const adminRoutes = require("./routes/adminRoutes");
const payoutRoutes = require("./routes/payoutRoutes");
const pushbackRoutes = require("./routes/pushbackRoutes");
const userTransactionRoutes = require("./routes/userTransactionRoutes");
const cors = require("cors");
const Razorpay = require("razorpay");
const connectDB = require("./config/db");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");

const app = express();

connectDB();
// Middleware
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "*",
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Routes
app.use("/api", userRoutes);
app.use("/api", offerRoutes);
app.use("/api", userTransactionRoutes);
app.use("/api", payoutRoutes);
app.use("/api", pushbackRoutes);
app.use("/api/admin", adminRoutes);

// Start the server
app.listen(process.env.PORT, () => {
  console.log("Server started on port 4000");
});

app.get("/", (req, res) => {
  // res.render("pages/auth");
  res.send("Server started");
});
