const express = require('express');
const router = express.Router();
const XLSX = require('xlsx');
const db = require('../config/database');
const { authenticateToken } = require('./auth');

router.use(authenticateToken);

function generateReportSummary(startDate, endDate) {
  const totalSales = db.prepare(`
    SELECT 
      COUNT(*) as totalOrders,
      SUM(total_amount) as totalRevenue,
      SUM(quantity) as totalQuantity
    FROM sales_data
    WHERE sale_date >= ? AND sale_date <= ?
  `).get(startDate, endDate);

  const storeSales = db.prepare(`
    SELECT 
      store_name as store,
      SUM(total_amount) as revenue,
      COUNT(*) as orders
    FROM sales_data
    WHERE sale_date >= ? AND sale_date <= ?
    GROUP BY store_name
    ORDER BY revenue DESC
  `).all(startDate, endDate);

  const categorySales = db.prepare(`
    SELECT 
      category as name,
      SUM(total_amount) as value
    FROM sales_data
    WHERE sale_date >= ? AND sale_date <= ?
    GROUP BY category
    ORDER BY value DESC
  `).all(startDate, endDate);

  const topProducts = db.prepare(`
    SELECT 
      product_name as name,
      SUM(total_amount) as revenue,
      SUM(quantity) as quantity
    FROM sales_data
    WHERE sale_date >= ? AND sale_date <= ?
    GROUP BY product_name
    ORDER BY revenue DESC
    LIMIT 10
  `).all(startDate, endDate);

  const dailyTrend = db.prepare(`
    SELECT 
      sale_date as date,
      SUM(total_amount) as revenue,
      COUNT(*) as orders
    FROM sales_data
    WHERE sale_date >= ? AND sale_date <= ?
    GROUP BY sale_date
    ORDER BY date
  `).all(startDate, endDate);

  return {
    summary: {
      totalOrders: totalSales.totalOrders || 0,
      totalRevenue: totalSales.totalRevenue || 0,
      totalQuantity: totalSales.totalQuantity || 0,
      avgOrderValue: totalSales.totalOrders > 0 ? (totalSales.totalRevenue / totalSales.totalOrders).toFixed(2) : 0
    },
    storeSales,
    categorySales,
    topProducts,
    dailyTrend
  };
}

function generateRecommendations(data) {
  const recommendations = [];

  if (data.storeSales.length > 1) {
    const topStore = data.storeSales[0];
    const bottomStore = data.storeSales[data.storeSales.length - 1];
    recommendations.push({
      type: 'store',
      title: '门店优化建议',
      content: `建议参考「${topStore.store}」的成功经验，帮助「${bottomStore.store}」提升销售业绩。`
    });
  }

  if (data.categorySales.length > 0) {
    const topCategory = data.categorySales[0];
    recommendations.push({
      type: 'category',
      title: '品类策略建议',
      content: `「${topCategory.name}」是销售主力品类，建议增加库存并策划专项营销活动。`
    });
  }

  if (data.topProducts.length >= 3) {
    const top3Names = data.topProducts.slice(0, 3).map(p => p.name).join('、');
    recommendations.push({
      type: 'product',
      title: '热销商品策略',
      content: `热销商品 TOP3: ${top3Names}，建议捆绑销售或设置为推荐商品。`
    });
  }

  if (data.summary.totalOrders > 0) {
    recommendations.push({
      type: 'general',
      title: '客单价分析',
      content: `当前平均客单价为 ¥${data.summary.avgOrderValue}，建议通过满减活动提升客单价。`
    });
  }

  return recommendations;
}

router.post('/generate', (req, res) => {
  try {
    const { reportName, startDate, endDate } = req.body;

    if (!startDate || !endDate) {
      return res.status(400).json({ success: false, message: '请选择日期范围' });
    }

    const reportData = generateReportSummary(startDate, endDate);
    const recommendations = generateRecommendations(reportData);

    const content = JSON.stringify({ ...reportData, recommendations });
    const summary = `报告涵盖 ${reportData.summary.totalOrders} 笔订单，总销售额 ¥${reportData.summary.totalRevenue.toLocaleString()}`;

    const result = db.prepare(`
      INSERT INTO reports (report_name, report_type, start_date, end_date, summary, content, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(reportName || `销售分析报告_${startDate}_${endDate}`, 'sales', startDate, endDate, summary, content, req.user.id);

    res.json({
      success: true,
      message: '报告生成成功',
      data: {
        id: result.lastInsertRowid,
        ...reportData,
        recommendations
      }
    });
  } catch (error) {
    console.error('生成报告错误:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/', (req, res) => {
  try {
    const { page = 1, pageSize = 10 } = req.query;
    const offset = (page - 1) * pageSize;

    const reports = db.prepare(`
      SELECT r.*, u.real_name as creator_name
      FROM reports r
      LEFT JOIN users u ON r.created_by = u.id
      ORDER BY r.created_at DESC
      LIMIT ? OFFSET ?
    `).all(parseInt(pageSize), offset);

    const total = db.prepare('SELECT COUNT(*) as total FROM reports').get().total;

    res.json({
      success: true,
      data: reports,
      pagination: { page: parseInt(page), pageSize: parseInt(pageSize), total }
    });
  } catch (error) {
    console.error('获取报告列表错误:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/:id', (req, res) => {
  try {
    const report = db.prepare(`
      SELECT r.*, u.real_name as creator_name
      FROM reports r
      LEFT JOIN users u ON r.created_by = u.id
      WHERE r.id = ?
    `).get(req.params.id);

    if (!report) {
      return res.status(404).json({ success: false, message: '报告不存在' });
    }

    report.content = JSON.parse(report.content);
    res.json({ success: true, data: report });
  } catch (error) {
    console.error('获取报告详情错误:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/:id/export', (req, res) => {
  try {
    const report = db.prepare('SELECT * FROM reports WHERE id = ?').get(req.params.id);
    if (!report) {
      return res.status(404).json({ success: false, message: '报告不存在' });
    }

    const content = JSON.parse(report.content);

    const wb = XLSX.utils.book_new();

    const summaryData = [
      ['指标', '数值'],
      ['总订单数', content.summary.totalOrders],
      ['总销售额', `¥${content.summary.totalRevenue.toLocaleString()}`],
      ['总销量', content.summary.totalQuantity],
      ['平均客单价', `¥${content.summary.avgOrderValue}`]
    ];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(summaryData), '核心指标');

    if (content.storeSales.length > 0) {
      const storeData = [['门店名称', '销售额', '订单数'], ...content.storeSales.map(s => [s.store, s.revenue, s.orders])];
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(storeData), '门店销售');
    }

    if (content.categorySales.length > 0) {
      const categoryData = [['品类名称', '销售额'], ...content.categorySales.map(c => [c.name, c.value])];
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(categoryData), '品类销售');
    }

    if (content.topProducts.length > 0) {
      const productData = [['商品名称', '销售额', '销量'], ...content.topProducts.map(p => [p.name, p.revenue, p.quantity])];
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(productData), '热销商品');
    }

    if (content.dailyTrend.length > 0) {
      const trendData = [['日期', '销售额', '订单数'], ...content.dailyTrend.map(d => [d.date, d.revenue, d.orders])];
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(trendData), '销售趋势');
    }

    if (content.recommendations.length > 0) {
      const recData = [['类型', '标题', '内容'], ...content.recommendations.map(r => [r.type, r.title, r.content])];
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(recData), '智能建议');
    }

    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=${encodeURIComponent(report.report_name)}.xlsx`);
    res.send(excelBuffer);
  } catch (error) {
    console.error('导出报告错误:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete('/:id', (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: '只有管理员可以删除报告' });
    }

    db.prepare('DELETE FROM reports WHERE id = ?').run(req.params.id);
    res.json({ success: true, message: '报告删除成功' });
  } catch (error) {
    console.error('删除报告错误:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
