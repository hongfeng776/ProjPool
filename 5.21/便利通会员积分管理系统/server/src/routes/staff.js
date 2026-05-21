const express = require('express');
const router = express.Router();
const Staff = require('../models/Staff');
const Member = require('../models/Member');
const PointsLog = require('../models/PointsLog');

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ code: 400, message: '账号和密码不能为空', data: null });
    }

    const staff = await Staff.findOne({ username });
    if (!staff || staff.password !== password) {
      return res.status(400).json({ code: 400, message: '账号或密码错误', data: null });
    }

    const staffData = staff.toObject();
    delete staffData.password;
    res.json({ code: 0, message: '登录成功', data: staffData });
  } catch (error) {
    console.error('[Staff] 登录失败:', error);
    res.status(500).json({ code: 500, message: '登录失败', data: null });
  }
});

const authAdmin = async (req, res, next) => {
  const staffId = req.headers['x-staff-id'];
  if (!staffId) {
    return res.status(401).json({ code: 401, message: '未登录', data: null });
  }
  try {
    const staff = await Staff.findById(staffId);
    if (!staff) {
      return res.status(401).json({ code: 401, message: '员工不存在', data: null });
    }
    req.staff = staff;
    next();
  } catch (error) {
    res.status(500).json({ code: 500, message: '验证失败', data: null });
  }
};

const authStaffOnly = (req, res, next) => {
  authAdmin(req, res, () => next());
};

const authAdminOnly = (req, res, next) => {
  authAdmin(req, res, () => {
    if (req.staff.role !== 'admin') {
      return res.status(403).json({ code: 403, message: '无权限操作，仅管理员可执行', data: null });
    }
    next();
  });
};

router.get('/members', authStaffOnly, async (req, res) => {
  try {
    const members = await Member.find().select('-password').sort({ createdAt: -1 });
    res.json({ code: 0, message: '获取成功', data: members });
  } catch (error) {
    console.error('[Staff] 获取会员列表失败:', error);
    res.status(500).json({ code: 500, message: '获取失败', data: null });
  }
});

router.get('/members/:id', authStaffOnly, async (req, res) => {
  try {
    const member = await Member.findById(req.params.id).select('-password');
    if (!member) {
      return res.status(404).json({ code: 404, message: '会员不存在', data: null });
    }
    res.json({ code: 0, message: '获取成功', data: member });
  } catch (error) {
    console.error('[Staff] 获取会员详情失败:', error);
    res.status(500).json({ code: 500, message: '获取失败', data: null });
  }
});

router.put('/members/:id/points', authAdminOnly, async (req, res) => {
  try {
    const { points, description } = req.body;

    if (points === undefined || points === null) {
      return res.status(400).json({ code: 400, message: '积分数值不能为空', data: null });
    }

    const member = await Member.findById(req.params.id);
    if (!member) {
      return res.status(404).json({ code: 404, message: '会员不存在', data: null });
    }

    const newPoints = member.points + points;
    if (newPoints < 0) {
      return res.status(400).json({ code: 400, message: '积分不足，扣减后积分不能为负', data: null });
    }

    member.points = newPoints;
    member.updatedAt = Date.now();
    await member.save();

    const pointsLog = new PointsLog({
      memberId: member._id,
      type: points > 0 ? 'earn' : 'spend',
      amount: Math.abs(points),
      description: description || (points > 0 ? '管理员赠送积分' : '管理员扣减积分'),
      operatorId: req.staff._id,
      operatorName: req.staff.name
    });
    await pointsLog.save();

    const memberData = member.toObject();
    delete memberData.password;
    res.json({ code: 0, message: '积分调整成功', data: memberData });
  } catch (error) {
    console.error('[Staff] 调整积分失败:', error);
    res.status(500).json({ code: 500, message: '调整失败', data: null });
  }
});

router.get('/list', authAdminOnly, async (req, res) => {
  try {
    const staffs = await Staff.find().select('-password').sort({ createdAt: -1 });
    res.json({ code: 0, message: '获取成功', data: staffs });
  } catch (error) {
    console.error('[Staff] 获取列表失败:', error);
    res.status(500).json({ code: 500, message: '获取失败', data: null });
  }
});

router.post('/', authAdminOnly, async (req, res) => {
  try {
    const { username, password, name, role } = req.body;

    if (!username || !password || !name) {
      return res.status(400).json({ code: 400, message: '账号、密码、姓名不能为空', data: null });
    }

    const existing = await Staff.findOne({ username });
    if (existing) {
      return res.status(400).json({ code: 400, message: '账号已存在', data: null });
    }

    const newStaff = new Staff({
      username,
      password,
      name,
      role: role || 'staff'
    });

    await newStaff.save();
    const staffData = newStaff.toObject();
    delete staffData.password;
    res.json({ code: 0, message: '创建成功', data: staffData });
  } catch (error) {
    console.error('[Staff] 创建失败:', error);
    res.status(500).json({ code: 500, message: '创建失败', data: null });
  }
});

const seedDefaultStaff = async () => {
  try {
    const adminCount = await Staff.countDocuments({ role: 'admin' });
    if (adminCount === 0) {
      const defaultAdmin = new Staff({
        username: 'admin',
        password: '123456',
        name: '系统管理员',
        role: 'admin'
      });
      await defaultAdmin.save();
      console.log('[Staff] 默认管理员已创建: admin / 123456');
    }

    const staffCount = await Staff.countDocuments({ role: 'staff' });
    if (staffCount === 0) {
      const defaultStaff = new Staff({
        username: 'staff',
        password: '123456',
        name: '普通员工',
        role: 'staff'
      });
      await defaultStaff.save();
      console.log('[Staff] 默认员工已创建: staff / 123456');
    }
  } catch (error) {
    console.warn('[Staff] 创建默认账号失败:', error.message);
  }
};

module.exports = { router, authStaffOnly, authAdminOnly, seedDefaultStaff };
