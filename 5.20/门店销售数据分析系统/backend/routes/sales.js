const express = require('express');
const router = express.Router();
const db = require('../config/database');

router.get('/', (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 20;
    const offset = (page - 1) * pageSize;

    const data = db.prepare(`
      SELECT * FROM sales_data 
      ORDER BY sale_date DESC 
      LIMIT ? OFFSET ?
    `).all(pageSize, offset);

    const total = db.prepare('SELECT COUNT(*) as count FROM sales_data').get();

    res.json({
      success: true,
      data,
      pagination: {
        page,
        pageSize,
        total: total.count
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/stores', (req, res) => {
  try {
    const stores = db.prepare(`
      SELECT DISTINCT store_name as name 
      FROM sales_data 
      WHERE store_name IS NOT NULL AND store_name != ''
      ORDER BY store_name
    `).all();
    res.json({ success: true, data: stores.map(s => s.name) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/categories', (req, res) => {
  try {
    const categories = db.prepare(`
      SELECT DISTINCT category as name 
      FROM sales_data 
      WHERE category IS NOT NULL AND category != ''
      ORDER BY category
    `).all();
    res.json({ success: true, data: categories.map(c => c.name) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/payment-methods', (req, res) => {
  try {
    const methods = db.prepare(`
      SELECT DISTINCT payment_method as name 
      FROM sales_data 
      WHERE payment_method IS NOT NULL AND payment_method != ''
      ORDER BY payment_method
    `).all();
    res.json({ success: true, data: methods.map(m => m.name) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/customer-types', (req, res) => {
  try {
    const types = db.prepare(`
      SELECT DISTINCT customer_type as name 
      FROM sales_data 
      WHERE customer_type IS NOT NULL AND customer_type != ''
      ORDER BY customer_type
    `).all();
    res.json({ success: true, data: types.map(t => t.name) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
