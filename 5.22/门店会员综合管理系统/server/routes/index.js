const express = require('express')
const router = express.Router()

const memberRoutes = require('./member')
const productRoutes = require('./product')
const orderRoutes = require('./order')
const systemRoutes = require('./system')
const authRoutes = require('./auth')

router.get('/', (req, res) => {
  res.json({
    code: 200,
    message: 'API is running',
    data: {
      version: '1.0.0',
      timestamp: new Date().toISOString()
    }
  })
})

router.use('/auth', authRoutes)
router.use('/members', memberRoutes)
router.use('/products', productRoutes)
router.use('/orders', orderRoutes)
router.use('/system', systemRoutes)

module.exports = router
