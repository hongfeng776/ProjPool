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
    res.json(database.data.genres || []);
  } catch (error) {
    console.error('获取类型列表失败:', error);
    res.status(500).json({ error: '数据库连接失败' });
  }
});

router.post('/', async (req, res) => {
  try {
    const database = await getDB();
    const newGenre = {
      id: Date.now(),
      name: req.body.name
    };
    database.data.genres.push(newGenre);
    await database.write();
    res.status(201).json(newGenre);
  } catch (error) {
    console.error('添加类型失败:', error);
    res.status(500).json({ error: '数据库保存失败' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const database = await getDB();
    const index = database.data.genres.findIndex(g => g.id === parseInt(req.params.id));
    if (index === -1) {
      return res.status(404).json({ error: '分类未找到' });
    }
    const deleted = database.data.genres.splice(index, 1);
    await database.write();
    res.json(deleted[0]);
  } catch (error) {
    console.error('删除类型失败:', error);
    res.status(500).json({ error: '数据库删除失败' });
  }
});

module.exports = router;
