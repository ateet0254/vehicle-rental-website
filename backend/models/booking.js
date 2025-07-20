// booking.js

const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  vehicle: { type: mongoose.Schema.Types.ObjectId, ref: "Vehicle", required: true },
  startDateTime: { type: Date, required: true },
  endDateTime: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now },
  paid: { type: Boolean, default: false },  // for payment paid or not
  returned: {
    type: Boolean,
    default: false
  },
  cancelled: { type: Boolean, default: false }


});

module.exports = mongoose.model("Booking", bookingSchema);
