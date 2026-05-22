const mongoose = require('mongoose')

let connectionStatus = 'disconnected'

const connect = async () => {
  try {
    const uri = process.env.MONGODB_URI || 
      `mongodb://${process.env.MONGODB_HOST || 'localhost'}:${process.env.MONGODB_PORT || 27017}/${process.env.MONGODB_DATABASE || 'member_management'}`

    mongoose.connection.on('connected', () => {
      connectionStatus = 'connected'
      console.log('✅ MongoDB connected successfully')
    })

    mongoose.connection.on('error', (err) => {
      connectionStatus = 'error'
      console.error('❌ MongoDB connection error:', err)
    })

    mongoose.connection.on('disconnected', () => {
      connectionStatus = 'disconnected'
      console.log('⚠️  MongoDB disconnected')
    })

    await mongoose.connect(uri)
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB:', error)
    connectionStatus = 'error'
  }
}

const getStatus = () => {
  return connectionStatus
}

const getConnection = () => {
  return mongoose.connection
}

module.exports = {
  connect,
  getStatus,
  getConnection
}
