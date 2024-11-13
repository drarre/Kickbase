const mongoose = require('mongoose');

const PlayerSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    competitionId: { type: String, required: false },
    firstName: { type: String, required: false },
    name: { type: String, required: true },
    teamId: { type: String, required: true },
    position: { type: Number, required: true },
    return: { type: Number, required: false },
    status: { type: Number, required: true },
    marketValue: { type: Number, required: true },
    marketValueTrend: { type: Number, required: true },
    marketValueSevenDays: { type: Number, required: false },
    marketValueTwentyFourHours: { type: Number, required: true },
    points: { type: Number, required: true },
    averagePoints: { type: Number, required: true },
    expires: { type: Number, required: false }
});

    module.exports = mongoose.model('Player', PlayerSchema);
