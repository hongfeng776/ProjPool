const express = require('express');
const router = express.Router();
const XLSX = require('xlsx');
const db = require('../config/database');

router.get('/summary', (req, res) => {
  try {
    const totalSales = db.prepare(`
      SELECT 
        COUNT(*) as totalOrders,
        SUM(total_amount) as totalRevenue,
        SUM(quantity) as totalQuantity
      FROM sales_data
    `).get();

    const storeCount = db.prepare(`
      SELECT COUNT(DISTINCT store_name) as count 
      FROM sales_data 
      WHERE store_name IS NOT NULL AND store_name != ''
    `).get();

    const productCount = db.prepare(`
      SELECT COUNT(DISTINCT product_name) as count 
      FROM sales_data 
      WHERE product_name IS NOT NULL AND product_name != ''
    `).get();

    res.json({
      success: true,
      data: {
        totalOrders: totalSales.totalOrders || 0,
        totalRevenue: totalSales.totalRevenue || 0,
        totalQuantity: totalSales.totalQuantity || 0,
        storeCount: storeCount.count || 0,
        productCount: productCount.count || 0
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/sales-by-store', (req, res) => {
  try {
    const data = db.prepare(`
      SELECT 
        store_name as store,
        SUM(total_amount) as revenue,
        COUNT(*) as orders,
        SUM(quantity) as quantity
      FROM sales_data
      WHERE store_name IS NOT NULL AND store_name != ''
      GROUP BY store_name
      ORDER BY revenue DESC
      LIMIT 10
    `).all();

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/sales-by-category', (req, res) => {
  try {
    const data = db.prepare(`
      SELECT 
        category as name,
        SUM(total_amount) as value
      FROM sales_data
      WHERE category IS NOT NULL AND category != ''
      GROUP BY category
      ORDER BY value DESC
    `).all();

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/sales-by-date', (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const data = db.prepare(`
      SELECT 
        sale_date as date,
        SUM(total_amount) as revenue,
        COUNT(*) as orders
      FROM sales_data
      GROUP BY sale_date
      ORDER BY sale_date DESC
      LIMIT ?
    `).all(days);

    res.json({ success: true, data: data.reverse() });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/top-products', (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const data = db.prepare(`
      SELECT 
        product_name as name,
        SUM(total_amount) as revenue,
        SUM(quantity) as quantity
      FROM sales_data
      GROUP BY product_name
      ORDER BY revenue DESC
      LIMIT ?
    `).all(limit);

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

function buildFilterConditions(query, params, req) {
  const { startDate, endDate, store, category, paymentMethod, customerType } = req.query;

  if (startDate) {
    query += ' AND sale_date >= ?';
    params.push(startDate);
  }
  if (endDate) {
    query += ' AND sale_date <= ?';
    params.push(endDate);
  }
  if (store && store !== '') {
    query += ' AND store_name = ?';
    params.push(store);
  }
  if (category && category !== '') {
    query += ' AND category = ?';
    params.push(category);
  }
  if (paymentMethod && paymentMethod !== '') {
    query += ' AND payment_method = ?';
    params.push(paymentMethod);
  }
  if (customerType && customerType !== '') {
    query += ' AND customer_type = ?';
    params.push(customerType);
  }

  return { query, params };
}

router.get('/sales-report/daily', (req, res) => {
  try {
    let query = `
      SELECT 
        sale_date as date,
        SUM(total_amount) as revenue,
        COUNT(*) as orders,
        SUM(quantity) as quantity
      FROM sales_data
      WHERE 1=1
    `;
    let params = [];

    const result = buildFilterConditions(query, params, req);
    query = result.query;
    params = result.params;

    query += ' GROUP BY sale_date ORDER BY sale_date DESC';

    const data = db.prepare(query).all(...params);
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/sales-report/weekly', (req, res) => {
  try {
    let query = `
      SELECT 
        strftime('%Y年第%W周', sale_date) as week,
        strftime('%Y-%m-%d', date(sale_date, 'weekday 1')) as startDate,
        strftime('%Y-%m-%d', date(sale_date, 'weekday 7')) as endDate,
        SUM(total_amount) as revenue,
        COUNT(*) as orders,
        SUM(quantity) as quantity
      FROM sales_data
      WHERE 1=1
    `;
    let params = [];

    const result = buildFilterConditions(query, params, req);
    query = result.query;
    params = result.params;

    query += ` GROUP BY strftime('%Y-%W', sale_date) ORDER BY strftime('%Y-%W', sale_date) DESC`;

    const data = db.prepare(query).all(...params);
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/sales-report/monthly', (req, res) => {
  try {
    let query = `
      SELECT 
        strftime('%Y年%m月', sale_date) as month,
        SUM(total_amount) as revenue,
        COUNT(*) as orders,
        SUM(quantity) as quantity
      FROM sales_data
      WHERE 1=1
    `;
    let params = [];

    const result = buildFilterConditions(query, params, req);
    query = result.query;
    params = result.params;

    query += ` GROUP BY strftime('%Y-%m', sale_date) ORDER BY strftime('%Y-%m', sale_date) DESC`;

    const data = db.prepare(query).all(...params);
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/product-ranking', (req, res) => {
  try {
    const { limit = 50 } = req.query;
    let query = `
      SELECT 
        product_name as name,
        category,
        SUM(quantity) as totalQuantity,
        SUM(total_amount) as totalRevenue,
        COUNT(*) as orderCount
      FROM sales_data
      WHERE 1=1
    `;
    let params = [];

    const result = buildFilterConditions(query, params, req);
    query = result.query;
    params = result.params;

    query += ' GROUP BY product_name ORDER BY totalQuantity DESC LIMIT ?';
    params.push(parseInt(limit));

    const data = db.prepare(query).all(...params);
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/export/sales-report', (req, res) => {
  try {
    const { reportType, filters } = req.body;
    let query = '';
    let groupBy = '';

    switch (reportType) {
      case 'daily':
        query = `
          SELECT 
            sale_date as 日期,
            SUM(total_amount) as 销售额,
            COUNT(*) as 订单数,
            SUM(quantity) as 销量
          FROM sales_data
          WHERE 1=1
        `;
        groupBy = ' GROUP BY sale_date ORDER BY sale_date DESC';
        break;
      case 'weekly':
        query = `
          SELECT 
            strftime('%Y年第%W周', sale_date) as 周次,
            strftime('%Y-%m-%d', date(sale_date, 'weekday 1')) as 开始日期,
            strftime('%Y-%m-%d', date(sale_date, 'weekday 7')) as 结束日期,
            SUM(total_amount) as 销售额,
            COUNT(*) as 订单数,
            SUM(quantity) as 销量
          FROM sales_data
          WHERE 1=1
        `;
        groupBy = ` GROUP BY strftime('%Y-%W', sale_date) ORDER BY strftime('%Y-%W', sale_date) DESC`;
        break;
      case 'monthly':
        query = `
          SELECT 
            strftime('%Y年%m月', sale_date) as 月份,
            SUM(total_amount) as 销售额,
            COUNT(*) as 订单数,
            SUM(quantity) as 销量
          FROM sales_data
          WHERE 1=1
        `;
        groupBy = ` GROUP BY strftime('%Y-%m', sale_date) ORDER BY strftime('%Y-%m', sale_date) DESC`;
        break;
      case 'ranking':
        query = `
          SELECT 
            product_name as 商品名称,
            category as 品类,
            SUM(quantity) as 总销量,
            SUM(total_amount) as 总销售额,
            COUNT(*) as 订单数
          FROM sales_data
          WHERE 1=1
        `;
        groupBy = ' GROUP BY product_name ORDER BY 总销量 DESC';
        break;
      default:
        query = `
          SELECT 
            sale_date as 销售日期,
            store_name as 门店名称,
            product_name as 商品名称,
            category as 品类,
            quantity as 数量,
            unit_price as 单价,
            total_amount as 总金额,
            customer_type as 客户类型,
            payment_method as 支付方式
          FROM sales_data
          WHERE 1=1
        `;
        groupBy = ' ORDER BY sale_date DESC';
    }

    let params = [];
    if (filters) {
      if (filters.startDate) {
        query += ' AND sale_date >= ?';
        params.push(filters.startDate);
      }
      if (filters.endDate) {
        query += ' AND sale_date <= ?';
        params.push(filters.endDate);
      }
      if (filters.store && filters.store !== '') {
        query += ' AND store_name = ?';
        params.push(filters.store);
      }
      if (filters.category && filters.category !== '') {
        query += ' AND category = ?';
        params.push(filters.category);
      }
      if (filters.paymentMethod && filters.paymentMethod !== '') {
        query += ' AND payment_method = ?';
        params.push(filters.paymentMethod);
      }
      if (filters.customerType && filters.customerType !== '') {
        query += ' AND customer_type = ?';
        params.push(filters.customerType);
      }
    }

    query += groupBy;

    const data = db.prepare(query).all(...params);

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, '销售报表');

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=sales_report_${Date.now()}.xlsx`);
    res.send(excelBuffer);
  } catch (error) {
    console.error('导出错误:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/export/sales-data', (req, res) => {
  try {
    let query = `
      SELECT 
        sale_date as 销售日期,
        store_name as 门店名称,
        product_name as 商品名称,
        category as 品类,
        quantity as 数量,
        unit_price as 单价,
        total_amount as 总金额,
        customer_type as 客户类型,
        payment_method as 支付方式
      FROM sales_data
      WHERE 1=1
    `;
    let params = [];

    const result = buildFilterConditions(query, params, req);
    query = result.query;
    params = result.params;

    query += ' ORDER BY sale_date DESC';

    const data = db.prepare(query).all(...params);

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, '销售数据');

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=sales_data_${Date.now()}.xlsx`);
    res.send(excelBuffer);
  } catch (error) {
    console.error('导出错误:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
