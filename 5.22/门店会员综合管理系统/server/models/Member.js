const mongoose = require('mongoose')
const { getLevelByPoints } = require('../config/memberLevel')

const memberSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true,
    unique: true
  },
  level: {
    type: String,
    default: '普通会员'
  },
  points: {
    type: Number,
    default: 0
  },
  balance: {
    type: Number,
    default: 0
  },
  expireDate: {
    type: Date
  },
  status: {
    type: Number,
    default: 1
  },
  totalConsume: {
    type: Number,
    default: 0
  },
  totalPoints: {
    type: Number,
    default: 0
  },
  remark: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
})

memberSchema.pre('save', function(next) {
  this.updatedAt = Date.now()
  const levelConfig = getLevelByPoints(this.points)
  this.level = levelConfig.name
  next()
})

memberSchema.methods.isExpiringSoon = function(days = 7) {
  if (!this.expireDate) return false
  const now = new Date()
  const expireTime = new Date(this.expireDate)
  const diffTime = expireTime - now
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays > 0 && diffDays <= days
}

memberSchema.methods.isExpired = function() {
  if (!this.expireDate) return false
  return new Date() > new Date(this.expireDate)
}

memberSchema.methods.getDaysToExpire = function() {
  if (!this.expireDate) return null
  const now = new Date()
  const expireTime = new Date(this.expireDate)
  const diffTime = expireTime - now
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

module.exports = mongoose.model('Member', memberSchema)
