const mongoose = require('mongoose');

const pointsLogSchema = new mongoose.Schema({
  memberId: { type: mongoose.Schema.Types.ObjectId, ref: 'Member', required: true },
  type: { type: String, enum: ['earn', 'spend', 'exchange', 'consume', 'adjust'], required: true },
  amount: { type: Number, required: true },
  description: { type: String, default: '' },
  rewardId: { type: mongoose.Schema.Types.ObjectId, ref: 'Reward' },
  operatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff' },
  operatorName: { type: String },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('PointsLog', pointsLogSchema);
