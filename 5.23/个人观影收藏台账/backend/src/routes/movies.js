const express = require('express');
const router = express.Router();
const { db, initDB } = require('../database');

async function getDB() {
  if (!db.data) {
    await initDB();
  }
  await db.read();
  return db;
}

router.get('/', async (req, res) => {
  try {
    const database = await getDB();
    const { status, genre } = req.query;
    let movies = database.data.movies || [];
    
    if (status) {
      movies = movies.filter(m => m.status === status);
    }
    if (genre) {
      movies = movies.filter(m => m.genre.includes(genre));
    }
    
    res.json(movies);
  } catch (error) {
    console.error('获取电影列表失败:', error);
    res.status(500).json({ error: '数据库连接失败' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const database = await getDB();
    const movie = database.data.movies.find(m => m.id === parseInt(req.params.id));
    if (!movie) {
      return res.status(404).json({ error: '电影未找到' });
    }
    res.json(movie);
  } catch (error) {
    console.error('获取电影详情失败:', error);
    res.status(500).json({ error: '数据库连接失败' });
  }
});

router.post('/', async (req, res) => {
  try {
    const database = await getDB();
    const newMovie = {
      id: Date.now(),
      ...req.body,
      createdAt: new Date().toISOString()
    };
    database.data.movies.push(newMovie);
    await database.write();
    res.status(201).json(newMovie);
  } catch (error) {
    console.error('添加电影失败:', error);
    res.status(500).json({ error: '数据库保存失败' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const database = await getDB();
    const index = database.data.movies.findIndex(m => m.id === parseInt(req.params.id));
    if (index === -1) {
      return res.status(404).json({ error: '电影未找到' });
    }
    database.data.movies[index] = { ...database.data.movies[index], ...req.body };
    await database.write();
    res.json(database.data.movies[index]);
  } catch (error) {
    console.error('更新电影失败:', error);
    res.status(500).json({ error: '数据库更新失败' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const database = await getDB();
    const index = database.data.movies.findIndex(m => m.id === parseInt(req.params.id));
    if (index === -1) {
      return res.status(404).json({ error: '电影未找到' });
    }
    const deleted = database.data.movies.splice(index, 1);
    await database.write();
    res.json(deleted[0]);
  } catch (error) {
    console.error('删除电影失败:', error);
    res.status(500).json({ error: '数据库删除失败' });
  }
});

module.exports = router;
