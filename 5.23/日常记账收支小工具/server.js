const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const { Low } = require('lowdb');
const { JSONFile } = require('lowdb/node');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(bodyParser.json({ limit: '1mb' }));
app.use(express.static(path.join(__dirname, 'public')));

const file = path.join(__dirname, 'db.json');
const adapter = new JSONFile(file);
const defaultData = { 
  transactions: [], 
  categories: {
    expense: ['餐饮', '交通', '购物', '娱乐', '医疗', '教育', '住房', '其他'],
    income: ['工资', '奖金', '兼职', '投资', '红包', '退款', '其他']
  }
};
const db = new Low(adapter, defaultData);

async function initDB() {
  try {
    await db.read();
    db.data ||= defaultData;
    if (!db.data.transactions) db.data.transactions = [];
    if (!db.data.categories) db.data.categories = defaultData.categories;
    await db.write();
  } catch (error) {
    console.error('数据库初始化失败:', error);
  }
}

function validateTransaction(transaction) {
  const errors = [];
  
  if (!transaction.type || !['income', 'expense'].includes(transaction.type)) {
    errors.push('类型必须是 income 或 expense');
  }
  
  if (!transaction.category || typeof transaction.category !== 'string') {
    errors.push('分类为必填项');
  } else if (transaction.category.length > 50) {
    errors.push('分类名称不能超过50个字符');
  }
  
  const amount = parseFloat(transaction.amount);
  if (isNaN(amount) || amount <= 0) {
    errors.push('金额必须大于0');
  } else if (amount > 99999999.99) {
    errors.push('金额不能超过99,999,999.99');
  }
  
  if (transaction.date) {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(transaction.date)) {
      errors.push('日期格式必须为 YYYY-MM-DD');
    } else {
      const date = new Date(transaction.date);
      if (isNaN(date.getTime())) {
        errors.push('无效的日期');
      }
    }
  }
  
  if (transaction.description && typeof transaction.description === 'string' && transaction.description.length > 200) {
    errors.push('备注不能超过200个字符');
  }
  
  return errors;
}

function sanitizeTransaction(transaction) {
  return {
    type: transaction.type,
    category: String(transaction.category).trim().substring(0, 50),
    amount: Math.round(parseFloat(transaction.amount) * 100) / 100,
    description: transaction.description ? String(transaction.description).trim().substring(0, 200) : '',
    date: transaction.date || new Date().toISOString().split('T')[0]
  };
}

app.get('/api/transactions', async (req, res) => {
  try {
    await db.read();
    res.json(db.data.transactions || []);
  } catch (error) {
    console.error('获取交易记录失败:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
});

app.get('/api/transactions/:id', async (req, res) => {
  try {
    await db.read();
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: '无效的ID' });
    }
    const transaction = db.data.transactions.find(t => t.id === id);
    if (!transaction) {
      return res.status(404).json({ error: '记录不存在' });
    }
    res.json(transaction);
  } catch (error) {
    console.error('获取交易记录失败:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
});

app.post('/api/transactions', async (req, res) => {
  try {
    const errors = validateTransaction(req.body);
    if (errors.length > 0) {
      return res.status(400).json({ error: errors[0] });
    }
    
    await db.read();
    const sanitized = sanitizeTransaction(req.body);
    
    const newTransaction = {
      id: Date.now() + Math.floor(Math.random() * 1000),
      ...sanitized
    };
    
    db.data.transactions.unshift(newTransaction);
    await db.write();
    res.status(201).json(newTransaction);
  } catch (error) {
    console.error('创建交易记录失败:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
});

app.put('/api/transactions/:id', async (req, res) => {
  try {
    await db.read();
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: '无效的ID' });
    }
    
    const index = db.data.transactions.findIndex(t => t.id === id);
    if (index === -1) {
      return res.status(404).json({ error: '记录不存在' });
    }
    
    const errors = validateTransaction(req.body);
    if (errors.length > 0) {
      return res.status(400).json({ error: errors[0] });
    }
    
    const sanitized = sanitizeTransaction(req.body);
    db.data.transactions[index] = { ...db.data.transactions[index], ...sanitized };
    await db.write();
    res.json(db.data.transactions[index]);
  } catch (error) {
    console.error('更新交易记录失败:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
});

app.delete('/api/transactions/:id', async (req, res) => {
  try {
    await db.read();
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: '无效的ID' });
    }
    
    const initialLength = db.data.transactions.length;
    db.data.transactions = db.data.transactions.filter(t => t.id !== id);
    
    if (db.data.transactions.length === initialLength) {
      return res.status(404).json({ error: '记录不存在' });
    }
    
    await db.write();
    res.json({ message: '删除成功' });
  } catch (error) {
    console.error('删除交易记录失败:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
});

app.get('/api/summary', async (req, res) => {
  try {
    await db.read();
    const transactions = db.data.transactions || [];
    
    const income = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);
    
    const expense = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);
    
    res.json({
      income: Math.round(income * 100) / 100,
      expense: Math.round(expense * 100) / 100,
      balance: Math.round((income - expense) * 100) / 100,
      count: transactions.length
    });
  } catch (error) {
    console.error('获取汇总数据失败:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
});

app.get('/api/monthly-summary', async (req, res) => {
  try {
    await db.read();
    const { year, month } = req.query;
    
    const now = new Date();
    const targetYear = parseInt(year) || now.getFullYear();
    const targetMonth = parseInt(month) || now.getMonth() + 1;
    
    if (isNaN(targetYear) || targetYear < 1900 || targetYear > 2100) {
      return res.status(400).json({ error: '无效的年份' });
    }
    if (isNaN(targetMonth) || targetMonth < 1 || targetMonth > 12) {
      return res.status(400).json({ error: '无效的月份' });
    }
    
    const monthStr = `${targetYear}-${String(targetMonth).padStart(2, '0')}`;
    
    const monthlyTransactions = (db.data.transactions || []).filter(t => {
      return t.date && typeof t.date === 'string' && t.date.startsWith(monthStr);
    });
    
    const incomeTransactions = monthlyTransactions.filter(t => t.type === 'income');
    const expenseTransactions = monthlyTransactions.filter(t => t.type === 'expense');
    
    const income = incomeTransactions.reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);
    const expense = expenseTransactions.reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);
    
    res.json({
      year: targetYear,
      month: targetMonth,
      income: Math.round(income * 100) / 100,
      expense: Math.round(expense * 100) / 100,
      balance: Math.round((income - expense) * 100) / 100,
      incomeCount: incomeTransactions.length,
      expenseCount: expenseTransactions.length,
      totalCount: monthlyTransactions.length
    });
  } catch (error) {
    console.error('获取月度汇总数据失败:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
});

app.get('/api/categories', async (req, res) => {
  try {
    await db.read();
    const type = req.query.type;
    if (type && db.data.categories && db.data.categories[type]) {
      res.json(db.data.categories[type]);
    } else {
      res.json(db.data.categories);
    }
  } catch (error) {
    console.error('获取分类失败:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.use((req, res) => {
  res.status(404).json({ error: '接口不存在' });
});

app.use((error, req, res, next) => {
  console.error('服务器错误:', error);
  res.status(500).json({ error: '服务器内部错误' });
});

process.on('uncaughtException', (error) => {
  console.error('未捕获的异常:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('未处理的Promise拒绝:', reason);
});

initDB().then(() => {
  app.listen(PORT, () => {
    console.log(`服务器运行在 http://localhost:${PORT}`);
    console.log(`环境: ${process.env.NODE_ENV || 'development'}`);
  });
}).catch(error => {
  console.error('启动失败:', error);
  process.exit(1);
});
