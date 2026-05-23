const express = require('express');
const cors = require('cors');
const { initDB } = require('./database');
const moviesRouter = require('./routes/movies');
const genresRouter = require('./routes/genres');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api/movies', moviesRouter);
app.use('/api/genres', genresRouter);

app.get('/api', (req, res) => {
  res.json({ message: '个人观影收藏台账 API' });
});

app.get('/api/stats', async (req, res) => {
  try {
    const { db, initDB } = require('./database');
    if (!db.data) {
      await initDB();
    }
    await db.read();
    const movies = db.data.movies || [];
    const watched = movies.filter(m => m.status === 'watched').length;
    const wishlist = movies.filter(m => m.status === 'wishlist').length;
    
    res.json({
      total: movies.length,
      watched,
      wishlist
    });
  } catch (error) {
    console.error('获取统计数据失败:', error);
    res.status(500).json({ error: '数据库连接失败' });
  }
});

async function startServer() {
  await initDB();
  app.listen(PORT, () => {
    console.log(`服务器运行在 http://localhost:${PORT}`);
  });
}

startServer();
