// routes/vehicleRoutes.js

const express = require("express");
const router = express.Router();
const Vehicle = require("../models/vehicle");
const authMiddleware = require("../middleware/auth");
const adminMiddleware = require("../middleware/adminMiddleware");

// GET all vehicles
router.get("/", async (req, res) => {
  try {
    const vehicles = await Vehicle.find();
    res.json(vehicles);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// POST a new vehicle
router.post("/", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const newVehicle = new Vehicle(req.body);
    await newVehicle.save();
    res.status(201).json(newVehicle);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
