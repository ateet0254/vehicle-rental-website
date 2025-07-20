// adminRoutes.js

const express = require("express");
const router = express.Router();
const Vehicle = require("../models/vehicle");
const Booking = require("../models/booking");
const User = require("../models/user");
const authMiddleware = require("../middleware/auth");
const adminMiddleware = require("../middleware/adminMiddleware");


// GET all vehicles
router.get("/vehicles", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const vehicles = await Vehicle.find();
    res.json(vehicles);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// PATCH toggle vehicle availability
router.patch("/vehicles/:id/toggle", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) return res.status(404).json({ error: "Vehicle not found" });

    vehicle.available = !vehicle.available;
    await vehicle.save();

    res.json({ message: "Availability updated", available: vehicle.available });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// GET all bookings
router.get("/bookings", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("vehicle")
      .populate("user", "email");
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// GET all users
router.get("/users", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const users = await User.find({}, "name email role");
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// POST /api/admin/vehicles
router.post("/vehicles", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { name, type, pricePerHour, image } = req.body;
    const newVehicle = new Vehicle({ name, type, pricePerHour, image, available: true });
    await newVehicle.save();
    res.status(201).json(newVehicle);
  } catch (err) {
    res.status(500).json({ error: "Failed to add vehicle." });
  }
});

// DELETE a vehicle by ID
router.delete("/vehicles/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    await Vehicle.findByIdAndDelete(id);
    res.json({ message: "Vehicle removed successfully." });
  } catch (err) {

    // console.error("Error deleting vehicle:", err);

    res.status(500).json({ error: "Failed to delete vehicle." });
  }
});


// Maark vehicle returned.
// PATCH /api/admin/bookings/:id/mark-returned
router.patch("/bookings/:id/mark-returned", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ error: "Booking not found" });

    booking.returned = true;
    await booking.save();
    
    // ✅ Make vehicle available again
    if (booking.vehicle) {
      await Vehicle.findByIdAndUpdate(booking.vehicle, { available: true });
    }

    res.json({ message: "Booking marked as returned." });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});



module.exports = router;
