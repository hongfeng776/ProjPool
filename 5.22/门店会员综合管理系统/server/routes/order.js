const express = require('express')
const router = express.Router()

router.get('/', (req, res) => {
  res.json({
    code: 200,
    message: 'Order API - 功能开发中',
    data: []
  })
})

router.get('/list', (req, res) => {
  res.json({
    code: 200,
    message: 'success',
    data: {
      list: [],
      total: 0,
      page: 1,
      pageSize: 10
    }
  })
})

module.exports = router
