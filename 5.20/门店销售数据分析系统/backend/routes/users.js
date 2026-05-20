const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../config/database');
const { authenticateToken } = require('./auth');

router.use(authenticateToken);

router.get('/', (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: '只有管理员可以访问' });
    }

    const { page = 1, pageSize = 10, keyword } = req.query;
    const offset = (page - 1) * pageSize;

    let query = 'SELECT id, username, real_name, role, email, phone, status, last_login, created_at FROM users WHERE 1=1';
    const params = [];

    if (keyword) {
      query += ' AND (username LIKE ? OR real_name LIKE ? OR email LIKE ?)';
      params.push(`%${keyword}%`, `%${keyword}%`, `%${keyword}%`);
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(pageSize), offset);

    const users = db.prepare(query).all(...params);

    let countQuery = 'SELECT COUNT(*) as total FROM users WHERE 1=1';
    const countParams = [];
    if (keyword) {
      countQuery += ' AND (username LIKE ? OR real_name LIKE ? OR email LIKE ?)';
      countParams.push(`%${keyword}%`, `%${keyword}%`, `%${keyword}%`);
    }
    const total = db.prepare(countQuery).get(...countParams).total;

    res.json({
      success: true,
      data: users,
      pagination: { page: parseInt(page), pageSize: parseInt(pageSize), total }
    });
  } catch (error) {
    console.error('获取用户列表错误:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/:id', (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.id !== parseInt(req.params.id)) {
      return res.status(403).json({ success: false, message: '无权访问' });
    }

    const user = db.prepare('SELECT id, username, real_name, role, email, phone, status, last_login, created_at FROM users WHERE id = ?').get(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: '用户不存在' });
    }

    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/', (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: '只有管理员可以创建用户' });
    }

    const { username, password, realName, role = 'user', email, phone, status = 1 } = req.body;

    if (!username || !password) {
      return res.status(400).json({ success: false, message: '用户名和密码不能为空' });
    }

    const existingUser = db.prepare('SELECT id FROM users WHERE username = ?').get(username);
    if (existingUser) {
      return res.status(400).json({ success: false, message: '用户名已存在' });
    }

    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);

    const result = db.prepare(`
      INSERT INTO users (username, password, real_name, role, email, phone, status)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(username, hash, realName, role, email, phone, status);

    res.json({
      success: true,
      message: '用户创建成功',
      data: { id: result.lastInsertRowid }
    });
  } catch (error) {
    console.error('创建用户错误:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/:id', (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.id !== parseInt(req.params.id)) {
      return res.status(403).json({ success: false, message: '无权修改' });
    }

    const { realName, role, email, phone, status } = req.body;

    if (role && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: '只有管理员可以修改角色' });
    }

    const updates = [];
    const params = [];

    if (realName !== undefined) { updates.push('real_name = ?'); params.push(realName); }
    if (role !== undefined) { updates.push('role = ?'); params.push(role); }
    if (email !== undefined) { updates.push('email = ?'); params.push(email); }
    if (phone !== undefined) { updates.push('phone = ?'); params.push(phone); }
    if (status !== undefined && req.user.role === 'admin') { updates.push('status = ?'); params.push(status); }

    if (updates.length === 0) {
      return res.status(400).json({ success: false, message: '没有要更新的字段' });
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    params.push(parseInt(req.params.id));

    db.prepare(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`).run(...params);

    res.json({ success: true, message: '用户更新成功' });
  } catch (error) {
    console.error('更新用户错误:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete('/:id', (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: '只有管理员可以删除用户' });
    }

    if (req.user.id === parseInt(req.params.id)) {
      return res.status(400).json({ success: false, message: '不能删除自己' });
    }

    db.prepare('DELETE FROM users WHERE id = ?').run(req.params.id);

    res.json({ success: true, message: '用户删除成功' });
  } catch (error) {
    console.error('删除用户错误:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
