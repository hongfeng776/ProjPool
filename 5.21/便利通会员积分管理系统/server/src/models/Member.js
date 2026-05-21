const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  gender: { type: String, enum: ['男', '女', '保密'], default: '保密' },
  birthday: { type: Date },
  points: { type: Number, default: 0 },
  level: { type: String, default: '普通会员' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Member', memberSchema);
