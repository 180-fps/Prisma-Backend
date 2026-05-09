const mongoose = require('mongoose');

const tournamentSchema = new mongoose.Schema({
  tournamentId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    required: true
  },
  maxPlayers: {
    type: Number,
    default: 100
  },
  participants: [{
    accountId: String,
    displayName: String,
    points: { type: Number, default: 0 },
    kills: { type: Number, default: 0 },
    wins: { type: Number, default: 0 },
    matches: { type: Number, default: 0 },
    registeredAt: { type: Date, default: Date.now }
  }],
  prizes: [{
    placement: Number,
    vbucks: Number,
    items: [String]
  }],
  rules: {
    maxMatches: { type: Number, default: 10 },
    pointsPerKill: { type: Number, default: 20 },
    pointsPerWin: { type: Number, default: 100 },
    pointsPerTop10: { type: Number, default: 60 },
    pointsPerTop25: { type: Number, default: 30 }
  },
  status: {
    type: String,
    enum: ['upcoming', 'active', 'completed', 'cancelled'],
    default: 'upcoming'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Tournament', tournamentSchema);
