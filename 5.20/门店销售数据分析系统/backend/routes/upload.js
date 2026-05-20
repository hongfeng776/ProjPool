const express = require('express');
const router = express.Router();
const multer = require('multer');
const xlsx = require('xlsx');
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');
const db = require('../config/database');

const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

function parseExcel(filePath) {
  const workbook = xlsx.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  return xlsx.utils.sheet_to_json(worksheet);
}

function parseCSV(filePath) {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', reject);
  });
}

function normalizeData(row) {
  return {
    store_name: row['门店名称'] || row['store_name'] || row['门店'] || '',
    sale_date: row['销售日期'] || row['sale_date'] || row['日期'] || '',
    product_name: row['商品名称'] || row['product_name'] || row['商品'] || '',
    category: row['品类'] || row['category'] || row['分类'] || '',
    quantity: parseInt(row['数量'] || row['quantity'] || row['销售数量'] || 0),
    unit_price: parseFloat(row['单价'] || row['unit_price'] || 0),
    total_amount: parseFloat(row['总金额'] || row['total_amount'] || row['金额'] || 0),
    customer_type: row['客户类型'] || row['customer_type'] || '',
    payment_method: row['支付方式'] || row['payment_method'] || ''
  };
}

router.post('/', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: '请上传文件' });
    }

    const filePath = req.file.path;
    const fileExt = path.extname(req.file.originalname).toLowerCase();
    let data = [];

    if (fileExt === '.xlsx' || fileExt === '.xls') {
      data = parseExcel(filePath);
    } else if (fileExt === '.csv') {
      data = await parseCSV(filePath);
    } else {
      fs.unlinkSync(filePath);
      return res.status(400).json({ success: false, message: '不支持的文件格式，请上传Excel或CSV文件' });
    }

    if (data.length === 0) {
      fs.unlinkSync(filePath);
      return res.status(400).json({ success: false, message: '文件中没有数据' });
    }

    const insertStmt = db.prepare(`
      INSERT INTO sales_data 
      (store_name, sale_date, product_name, category, quantity, unit_price, total_amount, customer_type, payment_method)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const insertMany = db.transaction((rows) => {
      for (const row of rows) {
        const normalized = normalizeData(row);
        const total = normalized.total_amount || (normalized.quantity * normalized.unit_price);
        insertStmt.run(
          normalized.store_name,
          normalized.sale_date,
          normalized.product_name,
          normalized.category,
          normalized.quantity,
          normalized.unit_price,
          total,
          normalized.customer_type,
          normalized.payment_method
        );
      }
    });

    insertMany(data);

    const recordStmt = db.prepare(`
      INSERT INTO upload_records (file_name, file_type, record_count)
      VALUES (?, ?, ?)
    `);
    recordStmt.run(req.file.originalname, fileExt, data.length);

    fs.unlinkSync(filePath);

    res.json({
      success: true,
      message: `成功导入 ${data.length} 条数据`,
      count: data.length
    });

  } catch (error) {
    console.error('上传错误:', error);
    res.status(500).json({ success: false, message: '导入失败: ' + error.message });
  }
});

router.get('/history', (req, res) => {
  try {
    const records = db.prepare('SELECT * FROM upload_records ORDER BY upload_time DESC LIMIT 20').all();
    res.json({ success: true, data: records });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
