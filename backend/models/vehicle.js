// vehicle.js

const mongoose = require("mongoose");

const vehicleSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, required: true }, // car, bike, scooter
  pricePerHour: { type: Number, required: true },
  available: { type: Boolean, default: true },
  image: { type: String } // URL to vehicle image (optional for now)
});

module.exports = mongoose.models.Vehicle || mongoose.model("Vehicle", vehicleSchema);

