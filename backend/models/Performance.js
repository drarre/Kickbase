const mongoose = require('mongoose');

const PerformanceSchema = new mongoose.Schema({
    seasonId: { type: String, required: true },
    seasonName: { type: String, required: true },
    playerId: { type: String, required: true },
    matches: [
        {
            day: { type: Number, required: true },
            points: { type: Number },
            minutesPlayed: { type: String },
            matchDate: { type: Date, required: true },
            homeTeamId: { type: String, required: true },
            awayTeamId: { type: String, required: true },
            homeTeamGoals: { type: Number },
            awayTeamGoals: { type: Number },
            playerTeamId: { type: String },
            status: { type: Number, required: true },
            events: [{ type: Number }],
            matchdayStatus: { type: Number },
            averagePoints: { type: Number },
            totalPoints: { type: Number },
            aggregateSeasonPoints: { type: Number }
        }
    ]
});

module.exports = mongoose.model('Performance', PerformanceSchema);