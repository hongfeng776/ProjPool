const mongoose = require('mongoose')

const pointRecordSchema = new mongoose.Schema({
  memberId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Member',
    required: true
  },
  memberName: {
    type: String,
    required: true
  },
  memberPhone: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['earn', 'consume', 'signin', 'exchange', 'adjust'],
    required: true
  },
  typeName: {
    type: String,
    required: true
  },
  points: {
    type: Number,
    required: true
  },
  balanceBefore: {
    type: Number,
    default: 0
  },
  balanceAfter: {
    type: Number,
    default: 0
  },
  description: {
    type: String,
    default: ''
  },
  operator: {
    type: String,
    default: '系统'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
})

module.exports = mongoose.model('PointRecord', pointRecordSchema)
