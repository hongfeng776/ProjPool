const express = require('express')
const router = express.Router()

router.get('/', (req, res) => {
  res.json({
    code: 200,
    message: 'System API - 功能开发中',
    data: []
  })
})

router.get('/settings', (req, res) => {
  res.json({
    code: 200,
    message: 'success',
    data: {}
  })
})

module.exports = router
