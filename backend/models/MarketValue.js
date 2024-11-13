const mongoose = require('mongoose');

const marketValueSchema = new mongoose.Schema({
    playerId: { type: String, required: true },
  dt: { type: Number, required: true, unique: false },
  mv: { type: Number, required: true }
});

module.exports = mongoose.model('MarketValue', marketValueSchema);