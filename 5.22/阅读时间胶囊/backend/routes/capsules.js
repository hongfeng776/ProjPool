const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../database');

router.get('/', (req, res) => {
  const capsules = db.prepare('SELECT * FROM capsules ORDER BY createdAt DESC').all()
    .map(c => ({
      ...c,
      isOpened: c.isOpened === 1
    }));
  res.json(capsules);
});

router.get('/:id', (req, res) => {
  const capsule = db.prepare('SELECT * FROM capsules WHERE id = ?').get(req.params.id);
  if (!capsule) return res.status(404).json({ message: '时间胶囊未找到' });
  res.json({
    ...capsule,
    isOpened: capsule.isOpened === 1
  });
});

function formatLocalDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

router.post('/', (req, res) => {
  const { title, content, bookId, bookTitle, openDate, mood } = req.body;
  const id = uuidv4();
  const createdAt = formatLocalDate(new Date());
  
  db.prepare(`
    INSERT INTO capsules (id, title, content, bookId, bookTitle, createdAt, openDate, isOpened, mood)
    VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?)
  `).run(id, title, content, bookId || null, bookTitle || '', createdAt, openDate || null, mood || 'inspired');
  
  const newCapsule = db.prepare('SELECT * FROM capsules WHERE id = ?').get(id);
  res.status(201).json({
    ...newCapsule,
    isOpened: newCapsule.isOpened === 1
  });
});

router.put('/:id/open', (req, res) => {
  const capsule = db.prepare('SELECT * FROM capsules WHERE id = ?').get(req.params.id);
  if (!capsule) return res.status(404).json({ message: '时间胶囊未找到' });
  
  db.prepare('UPDATE capsules SET isOpened = 1 WHERE id = ?').run(req.params.id);
  
  const updatedCapsule = db.prepare('SELECT * FROM capsules WHERE id = ?').get(req.params.id);
  res.json({
    ...updatedCapsule,
    isOpened: true
  });
});

router.delete('/:id', (req, res) => {
  const capsule = db.prepare('SELECT * FROM capsules WHERE id = ?').get(req.params.id);
  if (!capsule) return res.status(404).json({ message: '时间胶囊未找到' });
  
  db.prepare('DELETE FROM capsules WHERE id = ?').run(req.params.id);
  res.json({ message: '删除成功' });
});

module.exports = router;
