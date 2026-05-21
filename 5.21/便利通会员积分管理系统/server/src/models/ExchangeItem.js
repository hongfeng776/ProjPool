const mongoose = require('mongoose');

const exchangeItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  pointsRequired: { type: Number, required: true },
  stock: { type: Number, default: -1 },
  imageUrl: { type: String },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('ExchangeItem', exchangeItemSchema);
