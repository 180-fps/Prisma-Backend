const mongoose = require('mongoose');

const sacCodeSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  accountId: {
    type: String,
    required: true
  },
  displayName: {
    type: String,
    required: true
  },
  uses: {
    type: Number,
    default: 0
  },
  earnings: {
    type: Number,
    default: 0
  },
  active: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('SACCode', sacCodeSchema);
