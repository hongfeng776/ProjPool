require('dotenv').config();

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');

const connectDB = require('./config/db');
const { connectRedis } = require('./config/redis');

const indexRoutes = require('./routes/index');
const memberRoutes = require('./routes/member');
const pointsRoutes = require('./routes/points');
const { router: staffRoutes, seedDefaultStaff } = require('./routes/staff');
const productRoutes = require('./routes/product');

const app = express();
const PORT = process.env.PORT || 3000;

connectDB();
connectRedis();
setTimeout(() => {
  seedDefaultStaff();
}, 2000);

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api', indexRoutes);
app.use('/api/members', memberRoutes);
app.use('/api/points', pointsRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/products', productRoutes);

app.use(express.static(path.join(__dirname, '..', 'public')));

app.use((req, res) => {
  if (req.path.startsWith('/api')) {
    res.status(404).json({ code: 404, message: '接口不存在', data: null });
  } else {
    res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
  }
});

app.use((err, req, res, next) => {
  console.error('[Server] 全局异常:', err);
  const statusCode = err.statusCode || err.code || 500;
  res.status(statusCode >= 400 && statusCode < 600 ? statusCode : 500).json({ 
    code: statusCode,
    message: err.message || '服务器内部错误', 
    data: null 
  });
});

process.on('uncaughtException', (err) => {
  console.error('[Server] 未捕获异常:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('[Server] 未处理的 Promise 拒绝:', reason);
});

app.listen(PORT, () => {
  console.log(`[Server] 便利通后端服务运行在 http://localhost:${PORT}`);
});
