const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../database');

function formatLocalDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

router.get('/', (req, res) => {
  const records = db.prepare('SELECT * FROM reading_records ORDER BY date DESC').all();
  res.json(records);
});

router.get('/book/:bookId', (req, res) => {
  const records = db.prepare('SELECT * FROM reading_records WHERE bookId = ? ORDER BY date DESC')
    .all(req.params.bookId);
  res.json(records);
});

router.post('/', (req, res) => {
  const { bookId, bookTitle, duration, pages, note } = req.body;
  const id = uuidv4();
  const date = formatLocalDate(new Date());
  
  db.prepare(`
    INSERT INTO reading_records (id, bookId, bookTitle, date, duration, pages, note)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(id, bookId, bookTitle, date, duration || 0, pages || 0, note || '');
  
  if (bookId && pages > 0) {
    const book = db.prepare('SELECT currentPage, totalPages FROM books WHERE id = ?').get(bookId);
    if (book) {
      const newCurrentPage = Math.min(book.currentPage + pages, book.totalPages);
      const status = newCurrentPage >= book.totalPages ? 'completed' : 'reading';
      db.prepare('UPDATE books SET currentPage = ?, status = ? WHERE id = ?')
        .run(newCurrentPage, status, bookId);
    }
  }
  
  const newRecord = db.prepare('SELECT * FROM reading_records WHERE id = ?').get(id);
  res.status(201).json(newRecord);
});

router.delete('/:id', (req, res) => {
  const record = db.prepare('SELECT * FROM reading_records WHERE id = ?').get(req.params.id);
  if (!record) return res.status(404).json({ message: '记录未找到' });
  
  db.prepare('DELETE FROM reading_records WHERE id = ?').run(req.params.id);
  res.json({ message: '删除成功' });
});

router.get('/stats/summary', (req, res) => {
  const stats = db.prepare(`
    SELECT 
      COUNT(*) as totalRecords,
      COALESCE(SUM(duration), 0) as totalDuration,
      COALESCE(SUM(pages), 0) as totalPages
    FROM reading_records
  `).get();
  
  const avgDuration = stats.totalRecords > 0 ? Math.round(stats.totalDuration / stats.totalRecords) : 0;
  
  res.json({
    totalRecords: stats.totalRecords,
    totalDuration: stats.totalDuration,
    totalPages: stats.totalPages,
    avgDuration
  });
});

module.exports = router;
