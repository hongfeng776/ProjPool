const express = require('express');
const router = express.Router();
const Member = require('../models/Member');

const validatePhone = (phone) => {
  if (!phone) {
    return '手机号不能为空';
  }
  if (!/^\d+$/.test(phone)) {
    return '手机号必须是纯数字';
  }
  if (phone.length !== 11) {
    return `手机号长度必须为11位，当前${phone.length}位`;
  }
  if (!/^1[3-9]\d{9}$/.test(phone)) {
    return '手机号格式不正确，请输入正确的11位手机号';
  }
  return '';
};

router.get('/', async (req, res) => {
  try {
    const members = await Member.find().sort({ createdAt: -1 });
    res.json({ code: 0, message: '获取成功', data: members });
  } catch (error) {
    console.error('[Member] 获取会员列表失败:', error);
    res.status(500).json({ code: 500, message: '获取会员列表失败', data: null });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const member = await Member.findById(req.params.id);
    if (!member) {
      return res.status(404).json({ code: 404, message: '会员不存在', data: null });
    }
    res.json({ code: 0, message: '获取成功', data: member });
  } catch (error) {
    console.error('[Member] 获取会员详情失败:', error);
    res.status(500).json({ code: 500, message: '获取会员详情失败', data: null });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, phone, password } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ code: 400, message: '姓名不能为空', data: null });
    }

    const phoneError = validatePhone(phone);
    if (phoneError) {
      return res.status(400).json({ code: 400, message: phoneError, data: null });
    }

    if (!password || password.length < 6) {
      return res.status(400).json({ code: 400, message: '密码长度至少6位', data: null });
    }

    const existingMember = await Member.findOne({ phone });
    if (existingMember) {
      return res.status(400).json({ code: 400, message: '该手机号已注册', data: null });
    }

    const newMember = new Member({
      name: name.trim(),
      phone: phone.trim(),
      password: password,
      gender: '保密',
      points: 0,
      level: '普通会员'
    });

    await newMember.save();
    const memberData = newMember.toObject();
    delete memberData.password;
    res.json({ code: 0, message: '注册成功', data: memberData });
  } catch (error) {
    console.error('[Member] 新增会员失败:', error);
    if (error.code === 11000) {
      return res.status(400).json({ code: 400, message: '该手机号已注册', data: null });
    }
    res.status(500).json({ code: 500, message: '注册失败', data: null });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { phone, password } = req.body;

    const phoneError = validatePhone(phone);
    if (phoneError) {
      return res.status(400).json({ code: 400, message: phoneError, data: null });
    }

    if (!password) {
      return res.status(400).json({ code: 400, message: '密码不能为空', data: null });
    }

    const member = await Member.findOne({ phone });
    if (!member) {
      return res.status(400).json({ code: 400, message: '手机号或密码错误', data: null });
    }

    if (member.password !== password) {
      return res.status(400).json({ code: 400, message: '手机号或密码错误', data: null });
    }

    const memberData = member.toObject();
    delete memberData.password;
    res.json({ code: 0, message: '登录成功', data: memberData });
  } catch (error) {
    console.error('[Member] 登录失败:', error);
    res.status(500).json({ code: 500, message: '登录失败', data: null });
  }
});

router.get('/profile/:id', async (req, res) => {
  try {
    const member = await Member.findById(req.params.id);
    if (!member) {
      return res.status(404).json({ code: 404, message: '会员不存在', data: null });
    }
    const memberData = member.toObject();
    delete memberData.password;
    res.json({ code: 0, message: '获取成功', data: memberData });
  } catch (error) {
    console.error('[Member] 获取个人信息失败:', error);
    res.status(500).json({ code: 500, message: '获取失败', data: null });
  }
});

router.put('/profile/:id', async (req, res) => {
  try {
    const { name, gender, birthday } = req.body;

    const updateData = { updatedAt: Date.now() };
    if (name !== undefined) updateData.name = name.trim();
    if (gender !== undefined) updateData.gender = gender;
    if (birthday !== undefined) updateData.birthday = birthday;

    const member = await Member.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!member) {
      return res.status(404).json({ code: 404, message: '会员不存在', data: null });
    }
    const memberData = member.toObject();
    delete memberData.password;
    res.json({ code: 0, message: '更新成功', data: memberData });
  } catch (error) {
    console.error('[Member] 更新个人信息失败:', error);
    res.status(500).json({ code: 500, message: '更新失败', data: null });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { name, phone } = req.body;

    if (phone) {
      const phoneError = validatePhone(phone);
      if (phoneError) {
        return res.status(400).json({ code: 400, message: phoneError, data: null });
      }
    }

    const updateData = { updatedAt: Date.now() };
    if (name) updateData.name = name.trim();
    if (phone) updateData.phone = phone.trim();

    const member = await Member.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!member) {
      return res.status(404).json({ code: 404, message: '会员不存在', data: null });
    }
    res.json({ code: 0, message: '更新成功', data: member });
  } catch (error) {
    console.error('[Member] 更新会员失败:', error);
    if (error.code === 11000) {
      return res.status(400).json({ code: 400, message: '该手机号已被使用', data: null });
    }
    res.status(500).json({ code: 500, message: '更新失败', data: null });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const member = await Member.findByIdAndDelete(req.params.id);
    if (!member) {
      return res.status(404).json({ code: 404, message: '会员不存在', data: null });
    }
    res.json({ code: 0, message: '删除成功', data: null });
  } catch (error) {
    console.error('[Member] 删除会员失败:', error);
    res.status(500).json({ code: 500, message: '删除失败', data: null });
  }
});

module.exports = router;
