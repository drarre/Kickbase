const mongoose = require('mongoose');
const { PlayerSchema } = require('./Player');

const SquadSchema = new mongoose.Schema({
    leagueId: { type: String, required: true, unique: true },
    players: { type: [PlayerSchema], required: true },
});

module.exports = mongoose.model('Squad', SquadSchema);
