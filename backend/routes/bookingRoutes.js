
// routes/bookingRoutes.js

const express = require("express");
const router = express.Router();
const Booking = require("../models/booking");
const Vehicle = require("../models/vehicle");
const User = require("../models/user");
const authMiddleware = require("../middleware/auth");
const sendConfirmationEmail = require("../utils/sendConfirmationEmail");

// POST /api/bookings
router.post("/", authMiddleware, async (req, res) => {
  //  console.log("📥 Booking request body:", req.body);
  try {
    const { vehicleId, startDateTime, endDateTime } = req.body;

    if (!vehicleId || !startDateTime || !endDateTime) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const booking = new Booking({
      user: req.user.id,
      vehicle: vehicleId,
      startDateTime,
      endDateTime,
    });

    await booking.save();

    await Vehicle.findByIdAndUpdate(vehicleId, { available: false });

    res.status(201).json({ message: "Booking successful" });

  } catch (error) {
    console.error("❌ Booking failed:", error);
    res.status(500).json({ error: "Server error" });
  }
});
// for user's booking history
router.get("/my", authMiddleware, async (req, res) => {
  console.log("🔐 req.user =", req.user);
  try {
    const bookings = await Booking.find({ user: req.user.id })
      .populate("vehicle")
      .populate('user') 
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (err) {
    console.error("Error fetching bookings:", err);
    res.status(500).json({ error: "Failed to fetch bookings" });
  }
});

// Mark booking paid 
router.patch("/:id/mark-paid", authMiddleware, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate("user").populate("vehicle");

    if (!booking) return res.status(404).send("Booking not found");

    booking.paid = true;
    await booking.save();

    await sendConfirmationEmail(booking.user.email, booking);

    res.send("Marked as paid");
  } catch (err) {
    res.status(500).send("Error marking as paid");
  }
});

// PATCH /api/bookings/:id/cancel
router.patch("/:id/cancel", authMiddleware, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ error: "Booking not found" });

    // Only cancel if not already paid
    if (booking.paid) {
      return res.status(400).json({ error: "Cannot cancel a paid booking." });
    }

     // ✅ Make vehicle available again
    booking.cancelled = true;
    await booking.save();

    if (booking.vehicle) {
      await Vehicle.findByIdAndUpdate(booking.vehicle, { available: true });
    }

    res.json({ message: "Booking cancelled successfully." });
  } catch (err) {
    console.error("Cancel error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// GET receipt
router.get('/:id/receipt', authMiddleware, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('vehicle')
      .populate('user');

    if (!booking) return res.status(404).json({ error: "Booking not found" });

    if (booking.user._id.toString() !== req.user.id) {
      return res.status(403).json({ error: "Access denied" });
    }

    res.json(booking);
  } catch (err) {
    console.error("Receipt error:", err);
    res.status(500).json({ error: "Server error" });
  }
});



module.exports = router;


