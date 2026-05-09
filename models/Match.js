const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
  matchId: {
    type: String,
    required: true,
    unique: true
  },
  playlist: {
    type: String,
    required: true
  },
  players: [{
    accountId: String,
    displayName: String,
    kills: { type: Number, default: 0 },
    placement: { type: Number, default: 0 },
    damage: { type: Number, default: 0 },
    survived: { type: Number, default: 0 }
  }],
  status: {
    type: String,
    enum: ['waiting', 'starting', 'active', 'completed'],
    default: 'waiting'
  },
  startedAt: {
    type: Date,
    default: null
  },
  endedAt: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Match', matchSchema);
