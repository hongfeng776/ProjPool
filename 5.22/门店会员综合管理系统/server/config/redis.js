const Redis = require('ioredis')

let redisClient = null
let connectionStatus = 'disconnected'

const connect = () => {
  try {
    const options = {
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379,
      db: process.env.REDIS_DB || 0,
      retryStrategy: (times) => {
        return Math.min(times * 50, 2000)
      }
    }

    if (process.env.REDIS_PASSWORD) {
      options.password = process.env.REDIS_PASSWORD
    }

    redisClient = new Redis(options)

    redisClient.on('connect', () => {
      connectionStatus = 'connected'
      console.log('✅ Redis connected successfully')
    })

    redisClient.on('error', (err) => {
      connectionStatus = 'error'
      console.error('❌ Redis connection error:', err)
    })

    redisClient.on('close', () => {
      connectionStatus = 'disconnected'
      console.log('⚠️  Redis connection closed')
    })

  } catch (error) {
    console.error('❌ Failed to connect to Redis:', error)
    connectionStatus = 'error'
  }
}

const getStatus = () => {
  return connectionStatus
}

const getClient = () => {
  return redisClient
}

const set = async (key, value, expire = null) => {
  if (!redisClient) return null
  if (expire) {
    return redisClient.set(key, value, 'EX', expire)
  }
  return redisClient.set(key, value)
}

const get = async (key) => {
  if (!redisClient) return null
  return redisClient.get(key)
}

const del = async (key) => {
  if (!redisClient) return null
  return redisClient.del(key)
}

module.exports = {
  connect,
  getStatus,
  getClient,
  set,
  get,
  del
}
