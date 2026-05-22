const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { initDatabase } = require('./db');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

console.log('注册路由...');

const dreamRoutes = require('./routes/dreams');
app.use('/api/dreams', dreamRoutes);
console.log('已注册 /api/dreams 路由');

app.get('/api/health', (req, res) => {
  console.log('收到健康检查请求');
  res.json({ status: 'ok', message: '梦境图谱生成器服务运行正常' });
});

async function startServer() {
  try {
    await initDatabase();
    const server = app.listen(PORT, () => {
      console.log(`服务器运行在 http://localhost:${PORT}`);
      console.log('可用路由:');
      console.log('  GET  /api/health');
      console.log('  GET  /api/dreams');
      console.log('  GET  /api/dreams/keyword-graph');
      console.log('  GET  /api/dreams/:id');
      console.log('  POST /api/dreams');
      console.log('  PUT  /api/dreams/:id');
      console.log('  DELETE /api/dreams/:id');
    });

    server.on('error', (err) => {
      console.error('服务器错误:', err);
    });

    process.on('SIGTERM', () => {
      console.log('收到 SIGTERM，优雅关闭');
      server.close();
    });

    process.on('SIGINT', () => {
      console.log('收到 SIGINT，优雅关闭');
      server.close();
    });
  } catch (err) {
    console.error('启动服务器失败:', err);
  }
}

startServer();
