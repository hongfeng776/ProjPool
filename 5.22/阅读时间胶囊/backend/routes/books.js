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
  const books = db.prepare('SELECT * FROM books ORDER BY createdAt DESC').all();
  res.json(books);
});

router.get('/:id', (req, res) => {
  const book = db.prepare('SELECT * FROM books WHERE id = ?').get(req.params.id);
  if (!book) return res.status(404).json({ message: '书籍未找到' });
  res.json(book);
});

router.post('/', (req, res) => {
  const { title, author, cover, totalPages } = req.body;
  const id = uuidv4();
  const createdAt = formatLocalDate(new Date());
  
  db.prepare(`
    INSERT INTO books (id, title, author, cover, totalPages, currentPage, status, createdAt)
    VALUES (?, ?, ?, ?, ?, 0, 'pending', ?)
  `).run(id, title, author, cover || `https://picsum.photos/seed/${Date.now()}/200/300`, totalPages || 0, createdAt);
  
  const newBook = db.prepare('SELECT * FROM books WHERE id = ?').get(id);
  res.status(201).json(newBook);
});

router.put('/:id', (req, res) => {
  const book = db.prepare('SELECT * FROM books WHERE id = ?').get(req.params.id);
  if (!book) return res.status(404).json({ message: '书籍未找到' });
  
  const { title, author, cover, totalPages, currentPage, status } = req.body;
  const updatedBook = {
    ...book,
    title: title !== undefined ? title : book.title,
    author: author !== undefined ? author : book.author,
    cover: cover !== undefined ? cover : book.cover,
    totalPages: totalPages !== undefined ? totalPages : book.totalPages,
    currentPage: currentPage !== undefined ? currentPage : book.currentPage,
    status: status !== undefined ? status : book.status
  };
  
  db.prepare(`
    UPDATE books 
    SET title = ?, author = ?, cover = ?, totalPages = ?, currentPage = ?, status = ?
    WHERE id = ?
  `).run(updatedBook.title, updatedBook.author, updatedBook.cover, updatedBook.totalPages, 
         updatedBook.currentPage, updatedBook.status, req.params.id);
  
  res.json(updatedBook);
});

router.delete('/:id', (req, res) => {
  const book = db.prepare('SELECT * FROM books WHERE id = ?').get(req.params.id);
  if (!book) return res.status(404).json({ message: '书籍未找到' });
  
  db.prepare('DELETE FROM books WHERE id = ?').run(req.params.id);
  res.json({ message: '删除成功' });
});

router.get('/:id/capsules', (req, res) => {
  const capsules = db.prepare(`
    SELECT * FROM capsules 
    WHERE bookId = ? 
    ORDER BY createdAt DESC
  `).all(req.params.id).map(c => ({
    ...c,
    isOpened: c.isOpened === 1
  }));
  res.json(capsules);
});

router.get('/:id/capsules/count', (req, res) => {
  const result = db.prepare(`
    SELECT COUNT(*) as count 
    FROM capsules 
    WHERE bookId = ?
  `).get(req.params.id);
  res.json({ count: result.count });
});

module.exports = router;
