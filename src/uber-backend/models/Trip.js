const mongoose = require('mongoose');

const TripSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  driverName: { type: String, default: 'SKIP Driver' },
  distance: { type: String, required: true }, // Ej: "5.2 km"
  duration: { type: String, required: true }, // Ej: "15 mins"
  cost: { type: Number, required: true },     // Ej: 14500
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Trip', TripSchema);