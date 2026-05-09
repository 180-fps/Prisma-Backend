const mongoose = require('mongoose');

const shopItemSchema = new mongoose.Schema({
  itemId: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  type: {
    type: String,
    enum: ['skin', 'backbling', 'pickaxe', 'glider', 'emote', 'wrap', 'contrail', 'loadingscreen', 'bundle'],
    required: true
  },
  rarity: {
    type: String,
    enum: ['common', 'uncommon', 'rare', 'epic', 'legendary', 'icon', 'marvel', 'dc', 'starwars'],
    default: 'common'
  },
  price: {
    type: Number,
    required: true
  },
  section: {
    type: String,
    enum: ['featured', 'daily'],
    required: true
  },
  available: {
    type: Boolean,
    default: true
  },
  rotationDate: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    required: true
  }
});

const shopSchema = new mongoose.Schema({
  rotationId: {
    type: String,
    required: true,
    unique: true
  },
  items: [shopItemSchema],
  createdAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    required: true
  },
  active: {
    type: Boolean,
    default: true
  }
});

module.exports = mongoose.model('Shop', shopSchema);
