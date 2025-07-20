

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

require("dotenv").config();

// Route Imports
const app = express();
const vehicleRoutes = require("./routes/vehicleRoutes");
const authRoutes = require("./routes/authRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const adminRoutes = require("./routes/adminRoutes");
const paymentRoutes = require('./routes/paymentRoutes');
const path = require("path");
const userRoutes = require("./routes/userRoutes");


// Middleware
app.use(cors());
app.use(express.json());
app.use("/api/vehicles", vehicleRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/admin", adminRoutes);
app.use('/api/payment', paymentRoutes);
app.use("/images", express.static(path.join(__dirname, "images")));
app.use("/api/users", userRoutes);

// Test route
app.get("/", (req, res) => {
  res.send("🚗 Vehicle Rental Backend is Running!");
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Connect to MongoDB and start server
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ Connected to MongoDB");
    app.listen(process.env.PORT, () => {
      console.log(`🚀 Server is running at http://localhost:${process.env.PORT}`);
    });
  })
  .catch((error) => {
    console.error("❌ MongoDB connection failed:", error);
  });
