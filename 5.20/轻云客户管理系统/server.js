const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const JWT_SECRET = 'qingyun-crm-secret-key-2024';

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

const DATA_DIR = path.join(__dirname, 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const CUSTOMERS_FILE = path.join(DATA_DIR, 'customers.json');
const FOLLOWUPS_FILE = path.join(DATA_DIR, 'followups.json');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    console.log('创建data目录...');
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function readUsers() {
  ensureDataDir();
  if (!fs.existsSync(USERS_FILE)) {
    return [];
  }
  try {
    const data = fs.readFileSync(USERS_FILE, 'utf8');
    return JSON.parse(data || '[]');
  } catch (error) {
    console.error('读取用户文件错误:', error);
    return [];
  }
}

function writeUsers(users) {
  ensureDataDir();
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

function readCustomers() {
  ensureDataDir();
  if (!fs.existsSync(CUSTOMERS_FILE)) {
    return [];
  }
  try {
    const data = fs.readFileSync(CUSTOMERS_FILE, 'utf8');
    return JSON.parse(data || '[]');
  } catch (error) {
    console.error('读取客户文件错误:', error);
    return [];
  }
}

function writeCustomers(customers) {
  ensureDataDir();
  fs.writeFileSync(CUSTOMERS_FILE, JSON.stringify(customers, null, 2));
}

function readFollowups() {
  ensureDataDir();
  if (!fs.existsSync(FOLLOWUPS_FILE)) {
    return [];
  }
  try {
    const data = fs.readFileSync(FOLLOWUPS_FILE, 'utf8');
    return JSON.parse(data || '[]');
  } catch (error) {
    console.error('读取跟进记录文件错误:', error);
    return [];
  }
}

function writeFollowups(followups) {
  ensureDataDir();
  fs.writeFileSync(FOLLOWUPS_FILE, JSON.stringify(followups, null, 2));
}

function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ success: false, message: '未授权访问' });
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'token无效或已过期' });
  }
}

app.post('/api/register', async (req, res) => {
  try {
    console.log('收到注册请求:', req.body);
    const { username, password, email } = req.body;
    
    if (!username || !password || !email) {
      return res.status(400).json({ success: false, message: '请填写完整信息' });
    }

    const users = readUsers();
    
    if (users.find(u => u.username === username)) {
      return res.status(400).json({ success: false, message: '用户名已存在' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
      id: Date.now().toString(),
      username,
      email,
      password: hashedPassword,
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    writeUsers(users);

    console.log('用户注册成功:', username);
    res.json({ success: true, message: '注册成功' });
  } catch (error) {
    console.error('注册错误:', error);
    res.status(500).json({ success: false, message: '服务器错误: ' + error.message });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    console.log('收到登录请求:', req.body.username);
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ success: false, message: '请填写用户名和密码' });
    }

    const users = readUsers();
    const user = users.find(u => u.username === username);

    if (!user) {
      return res.status(400).json({ success: false, message: '用户名或密码错误' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    
    if (!isValidPassword) {
      return res.status(400).json({ success: false, message: '用户名或密码错误' });
    }

    const token = jwt.sign({ userId: user.id, username: user.username }, JWT_SECRET, { expiresIn: '24h' });

    console.log('用户登录成功:', username);
    res.json({ 
      success: true, 
      message: '登录成功',
      token,
      user: { id: user.id, username: user.username, email: user.email }
    });
  } catch (error) {
    console.error('登录错误:', error);
    res.status(500).json({ success: false, message: '服务器错误: ' + error.message });
  }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'register.html'));
});

app.get('/home', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'home.html'));
});

app.get('/customers', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'customers.html'));
});

app.get('/customer/:id', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'customer-detail.html'));
});

app.get('/statistics', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'statistics.html'));
});

app.get('/api/customers/:id', authMiddleware, (req, res) => {
  try {
    console.log('收到获取单个客户请求:', req.user.username);
    const customers = readCustomers();
    const customer = customers.find(c => c.id === req.params.id && c.userId === req.user.userId);
    
    if (!customer) {
      return res.status(404).json({ success: false, message: '客户不存在' });
    }
    
    res.json({ success: true, customer });
  } catch (error) {
    console.error('获取客户详情错误:', error);
    res.status(500).json({ success: false, message: '服务器错误: ' + error.message });
  }
});

app.post('/api/followups', authMiddleware, (req, res) => {
  try {
    console.log('收到新增跟进记录请求:', req.user.username);
    const { customerId, content, type, nextFollowDate } = req.body;
    
    if (!customerId || !content) {
      return res.status(400).json({ success: false, message: '客户ID和跟进内容为必填项' });
    }

    const followups = readFollowups();
    const newFollowup = {
      id: Date.now().toString(),
      userId: req.user.userId,
      customerId,
      content,
      type: type || '电话',
      nextFollowDate: nextFollowDate || '',
      createdAt: new Date().toISOString()
    };

    followups.push(newFollowup);
    writeFollowups(followups);

    console.log('跟进记录添加成功');
    res.json({ success: true, message: '跟进记录添加成功', followup: newFollowup });
  } catch (error) {
    console.error('新增跟进记录错误:', error);
    res.status(500).json({ success: false, message: '服务器错误: ' + error.message });
  }
});

app.get('/api/followups/:customerId', authMiddleware, (req, res) => {
  try {
    console.log('收到获取跟进记录请求:', req.user.username);
    const { customerId } = req.params;
    const followups = readFollowups();
    const customerFollowups = followups.filter(f => f.customerId === customerId && f.userId === req.user.userId);
    
    customerFollowups.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    console.log(`返回 ${customerFollowups.length} 条跟进记录`);
    res.json({ success: true, followups: customerFollowups });
  } catch (error) {
    console.error('获取跟进记录错误:', error);
    res.status(500).json({ success: false, message: '服务器错误: ' + error.message });
  }
});

app.post('/api/customers', authMiddleware, (req, res) => {
  try {
    console.log('收到新增客户请求:', req.user.username);
    const { name, phone, email, company, address, notes, stage } = req.body;
    
    if (!name || !phone) {
      return res.status(400).json({ success: false, message: '客户姓名和电话为必填项' });
    }

    const customers = readCustomers();
    const newCustomer = {
      id: Date.now().toString(),
      userId: req.user.userId,
      name,
      phone,
      email: email || '',
      company: company || '',
      address: address || '',
      notes: notes || '',
      stage: stage || 'lead',
      createdAt: new Date().toISOString()
    };

    customers.push(newCustomer);
    writeCustomers(customers);

    console.log('客户添加成功:', name);
    res.json({ success: true, message: '客户添加成功', customer: newCustomer });
  } catch (error) {
    console.error('新增客户错误:', error);
    res.status(500).json({ success: false, message: '服务器错误: ' + error.message });
  }
});

app.put('/api/customers/:id', authMiddleware, (req, res) => {
  try {
    console.log('收到更新客户请求:', req.user.username);
    const { id } = req.params;
    const { name, phone, email, company, address, notes, stage } = req.body;
    
    const customers = readCustomers();
    const index = customers.findIndex(c => c.id === id && c.userId === req.user.userId);
    
    if (index === -1) {
      return res.status(404).json({ success: false, message: '客户不存在' });
    }

    customers[index] = {
      ...customers[index],
      name: name || customers[index].name,
      phone: phone || customers[index].phone,
      email: email !== undefined ? email : customers[index].email,
      company: company !== undefined ? company : customers[index].company,
      address: address !== undefined ? address : customers[index].address,
      notes: notes !== undefined ? notes : customers[index].notes,
      stage: stage || customers[index].stage,
      updatedAt: new Date().toISOString()
    };

    writeCustomers(customers);
    res.json({ success: true, message: '客户更新成功', customer: customers[index] });
  } catch (error) {
    console.error('更新客户错误:', error);
    res.status(500).json({ success: false, message: '服务器错误: ' + error.message });
  }
});

app.get('/api/statistics/funnel', authMiddleware, (req, res) => {
  try {
    console.log('收到销售漏斗统计请求:', req.user.username);
    const customers = readCustomers();
    const userCustomers = customers.filter(c => c.userId === req.user.userId);
    
    const stages = [
      { key: 'lead', name: '线索', count: 0 },
      { key: 'contact', name: '接触', count: 0 },
      { key: 'demand', name: '需求确认', count: 0 },
      { key: 'proposal', name: '方案报价', count: 0 },
      { key: 'negotiation', name: '商务谈判', count: 0 },
      { key: 'deal', name: '成交', count: 0 }
    ];
    
    userCustomers.forEach(customer => {
      const stage = stages.find(s => s.key === customer.stage);
      if (stage) {
        stage.count++;
      }
    });
    
    const total = userCustomers.length;
    const conversionRate = total > 0 ? ((stages[5].count / total) * 100).toFixed(2) : 0;
    
    res.json({
      success: true,
      funnel: stages,
      total,
      conversionRate
    });
  } catch (error) {
    console.error('获取销售漏斗统计错误:', error);
    res.status(500).json({ success: false, message: '服务器错误: ' + error.message });
  }
});

app.get('/api/export/customers', authMiddleware, (req, res) => {
  try {
    console.log('收到客户数据导出请求:', req.user.username);
    const { format } = req.query;
    const customers = readCustomers();
    const userCustomers = customers.filter(c => c.userId === req.user.userId);
    
    const stageMap = {
      'lead': '线索',
      'contact': '接触',
      'demand': '需求确认',
      'proposal': '方案报价',
      'negotiation': '商务谈判',
      'deal': '成交'
    };
    
    if (format === 'csv') {
      const headers = ['客户姓名', '联系电话', '邮箱', '公司名称', '地址', '阶段', '备注', '创建时间'];
      const rows = userCustomers.map(c => [
        c.name,
        c.phone,
        c.email || '',
        c.company || '',
        c.address || '',
        stageMap[c.stage] || c.stage,
        c.notes || '',
        new Date(c.createdAt).toLocaleString('zh-CN')
      ]);
      
      const csvContent = [headers, ...rows]
        .map(row => row.map(cell => `"${cell.toString().replace(/"/g, '""')}"`).join(','))
        .join('\n');
      
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename=customers.csv');
      res.send('\uFEFF' + csvContent);
    } else {
      const exportData = userCustomers.map(c => ({
        name: c.name,
        phone: c.phone,
        email: c.email,
        company: c.company,
        address: c.address,
        stage: stageMap[c.stage] || c.stage,
        notes: c.notes,
        createdAt: new Date(c.createdAt).toLocaleString('zh-CN')
      }));
      
      res.json({
        success: true,
        data: exportData
      });
    }
  } catch (error) {
    console.error('导出客户数据错误:', error);
    res.status(500).json({ success: false, message: '服务器错误: ' + error.message });
  }
});

app.get('/api/customers', authMiddleware, (req, res) => {
  try {
    console.log('收到获取客户列表请求:', req.user.username);
    const customers = readCustomers();
    const userCustomers = customers.filter(c => c.userId === req.user.userId);
    console.log(`返回 ${userCustomers.length} 个客户`);
    res.json({ success: true, customers: userCustomers });
  } catch (error) {
    console.error('获取客户列表错误:', error);
    res.status(500).json({ success: false, message: '服务器错误: ' + error.message });
  }
});

const server = app.listen(PORT, () => {
  console.log(`轻云客户管理系统已启动: http://localhost:${PORT}`);
  console.log('服务器正在运行...');
});

server.on('error', (error) => {
  console.error('服务器错误:', error);
});

process.on('uncaughtException', (error) => {
  console.error('未捕获的异常:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('未处理的Promise拒绝:', reason);
});
