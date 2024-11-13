const mongoose = require('mongoose');
const { PlayerSchema } = require('./Player');

const TeamSchema = new mongoose.Schema({
    teamId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    totalValue: { type: Number, required: false },
    allPlayers: { type: [PlayerSchema], required: false },
});

module.exports = mongoose.model('Team', TeamSchema);