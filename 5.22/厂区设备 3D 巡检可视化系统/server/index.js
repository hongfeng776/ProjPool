const express = require('express')
const cors = require('cors')
require('dotenv').config()

const db = require('./config/database')

const app = express()
const PORT = process.env.PORT || 5000

app.use(cors())
app.use(express.json())

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: '服务器运行正常' })
})

app.get('/api/devices', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM devices ORDER BY id')
    res.json(result.rows)
  } catch (err) {
    console.error('获取设备列表失败:', err)
    res.status(500).json({ error: '获取设备列表失败' })
  }
})

app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`)
})
