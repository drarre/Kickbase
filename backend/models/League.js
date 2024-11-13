const mongoose = require('mongoose');

const LeagueSchema = new mongoose.Schema({
  leagueId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  balance: { type: Number, required: true },
  teamValue: { type: Number, required: true },

});

module.exports = mongoose.model('League', LeagueSchema);