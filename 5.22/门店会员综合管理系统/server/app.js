require('dotenv').config()
const express = require('express')
const cors = require('cors')
const morgan = require('morgan')
const path = require('path')

const mongodb = require('./config/mongodb')
const redis = require('./config/redis')
const routes = require('./routes')
const responseHandler = require('./middlewares/response')

const app = express()
const PORT = process.env.PORT || 3000

app.use(cors())
app.use(morgan('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, 'public')))
app.use(responseHandler)

mongodb.connect()
redis.connect()

app.get('/api/health', (req, res) => {
  let mongoStatus = 'unknown'
  let redisStatus = 'unknown'
  
  try {
    mongoStatus = mongodb.getStatus()
  } catch (e) {
    mongoStatus = 'error'
  }
  
  try {
    redisStatus = redis.getStatus()
  } catch (e) {
    redisStatus = 'error'
  }
  
  res.json({
    code: 200,
    message: 'success',
    data: {
      status: 'ok',
      timestamp: new Date().toISOString(),
      mongodb: mongoStatus,
      redis: redisStatus
    }
  })
})

app.use('/api', routes)

app.use((req, res) => {
  res.status(404).json({
    code: 404,
    message: 'Not Found',
    data: null
  })
})

app.use((err, req, res, next) => {
  console.error('Server error:', err)
  res.status(500).json({
    code: 500,
    message: err.message || 'Internal Server Error',
    data: null
  })
})

app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`)
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`)
})
