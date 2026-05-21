const express = require('express');
const router = express.Router();
const PointsLog = require('../models/PointsLog');
const Member = require('../models/Member');

router.get('/', async (req, res) => {
  try {
    const { memberId } = req.query;
    const query = memberId ? { memberId } : {};
    const logs = await PointsLog.find(query).sort({ createdAt: -1 }).limit(100);
    res.json({ code: 0, message: '获取成功', data: logs });
  } catch (error) {
    console.error('[Points] 获取积分记录失败:', error);
    res.status(500).json({ code: 500, message: '获取失败', data: null });
  }
});

router.post('/', async (req, res) => {
  try {
    const { memberId, type, amount, description } = req.body;

    if (!memberId || !type || !amount) {
      return res.status(400).json({ code: 400, message: '参数不完整', data: null });
    }

    if (!['earn', 'spend', 'consume', 'exchange', 'adjust'].includes(type)) {
      return res.status(400).json({ code: 400, message: '积分类型无效', data: null });
    }

    if (typeof amount !== 'number' || amount <= 0) {
      return res.status(400).json({ code: 400, message: '积分数值必须为正数', data: null });
    }

    const member = await Member.findById(memberId);
    if (!member) {
      return res.status(404).json({ code: 404, message: '会员不存在', data: null });
    }

    if (type === 'earn' || type === 'consume' || type === 'adjust') {
      member.points += amount;
    } else {
      if (member.points < amount) {
        return res.status(400).json({ code: 400, message: '积分不足', data: null });
      }
      member.points -= amount;
    }

    await member.save();

    const log = new PointsLog({
      memberId: member._id,
      type,
      amount,
      description: description || ''
    });
    await log.save();

    res.json({ code: 0, message: '操作成功', data: { points: member.points, log } });
  } catch (error) {
    console.error('[Points] 积分操作失败:', error);
    res.status(500).json({ code: 500, message: '操作失败', data: null });
  }
});

router.post('/consume', async (req, res) => {
  try {
    const { memberId, amount, description } = req.body;

    if (!memberId || !amount) {
      return res.status(400).json({ code: 400, message: '参数不完整', data: null });
    }

    if (typeof amount !== 'number' || amount <= 0) {
      return res.status(400).json({ code: 400, message: '消费金额必须为正数', data: null });
    }

    const member = await Member.findById(memberId);
    if (!member) {
      return res.status(404).json({ code: 404, message: '会员不存在', data: null });
    }

    const earnPoints = Math.floor(amount);

    member.points += earnPoints;
    await member.save();

    const log = new PointsLog({
      memberId: member._id,
      type: 'consume',
      amount: earnPoints,
      description: description || `消费 ¥${amount}，累计积分 ${earnPoints}`
    });
    await log.save();

    res.json({ 
      code: 0, 
      message: '消费累计成功', 
      data: { 
        consumeAmount: amount,
        earnPoints,
        points: member.points 
      } 
    });
  } catch (error) {
    console.error('[Points] 消费累计失败:', error);
    res.status(500).json({ code: 500, message: '操作失败', data: null });
  }
});

router.get('/logs/:memberId', async (req, res) => {
  try {
    const { memberId } = req.params;
    const logs = await PointsLog.find({ memberId }).sort({ createdAt: -1 }).limit(50);
    res.json({ code: 0, message: '获取成功', data: logs });
  } catch (error) {
    console.error('[Points] 获取积分日志失败:', error);
    res.status(500).json({ code: 500, message: '获取失败', data: null });
  }
});

module.exports = router;
