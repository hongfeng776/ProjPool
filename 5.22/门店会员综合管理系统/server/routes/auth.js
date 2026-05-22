const express = require('express')
const router = express.Router()

router.post('/login', (req, res) => {
  res.json({
    code: 200,
    message: '登录功能开发中',
    data: {
      token: 'demo-token',
      userInfo: {
        username: 'admin',
        role: 'admin'
      }
    }
  })
})

router.post('/logout', (req, res) => {
  res.json({
    code: 200,
    message: '登出成功',
    data: null
  })
})

module.exports = router
