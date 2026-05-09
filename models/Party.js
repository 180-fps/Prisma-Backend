const mongoose = require('mongoose');

const partySchema = new mongoose.Schema({
  partyId: {
    type: String,
    required: true,
    unique: true
  },
  leaderId: {
    type: String,
    required: true
  },
  members: [{
    accountId: String,
    displayName: String,
    joinedAt: { type: Date, default: Date.now },
    ready: { type: Boolean, default: false }
  }],
  maxMembers: {
    type: Number,
    default: 4
  },
  privacy: {
    type: String,
    enum: ['public', 'friends', 'private'],
    default: 'public'
  },
  playlist: {
    type: String,
    default: 'Playlist_DefaultSolo'
  },
  inMatch: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Party', partySchema);
