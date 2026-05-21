const mongoose = require('mongoose');

const exchangeLogSchema = new mongoose.Schema({
  memberId: { type: mongoose.Schema.Types.ObjectId, ref: 'Member', required: true },
  itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'ExchangeItem', required: true },
  itemName: { type: String, required: true },
  pointsCost: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'completed', 'cancelled'], default: 'pending' },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('ExchangeLog', exchangeLogSchema);
