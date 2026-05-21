const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Member = require('../models/Member');
const ExchangeLog = require('../models/ExchangeLog');
const PointsLog = require('../models/PointsLog');

const defaultProducts = [
  { name: '5元优惠券', description: '消费满50元可用', points: 500, image: '🎫' },
  { name: '10元优惠券', description: '消费满100元可用', points: 1000, image: '🎟️' },
  { name: '20元优惠券', description: '消费满200元可用', points: 2000, image: '💳' },
  { name: '矿泉水一瓶', description: '500ml 矿泉水', points: 100, image: '💧' },
  { name: '精美购物袋', description: '环保购物袋', points: 300, image: '🛍️' },
  { name: '雨伞一把', description: '便携折叠伞', points: 800, image: '☂️' },
  { name: '抽纸一包', description: '软抽纸巾', points: 200, image: '🧻' },
  { name: '洗衣液一袋', description: '500g 洗衣液', points: 500, image: '🧺' },
];

router.get('/init', async (req, res) => {
  try {
    const count = await Product.countDocuments();
    if (count > 0) {
      return res.json({ code: 0, message: '商品已初始化', data: { count } });
    }
    await Product.insertMany(defaultProducts);
    res.json({ code: 0, message: '商品初始化成功', data: null });
  } catch (error) {
    console.error('[Product] 初始化失败:', error);
    res.status(500).json({ code: 500, message: '初始化失败', data: null });
  }
});

router.get('/', async (req, res) => {
  try {
    const products = await Product.find({ status: 'active' }).sort({ points: 1 });
    res.json({ code: 0, message: '获取成功', data: products });
  } catch (error) {
    console.error('[Product] 获取列表失败:', error);
    res.status(500).json({ code: 500, message: '获取失败', data: null });
  }
});

router.post('/exchange', async (req, res) => {
  try {
    const { memberId, productId } = req.body;

    if (!memberId || !productId) {
      return res.status(400).json({ code: 400, message: '参数不完整', data: null });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ code: 404, message: '商品不存在', data: null });
    }
    if (product.status !== 'active') {
      return res.status(400).json({ code: 400, message: '商品已下架', data: null });
    }
    if (product.stock <= 0) {
      return res.status(400).json({ code: 400, message: '商品库存不足', data: null });
    }

    const member = await Member.findById(memberId);
    if (!member) {
      return res.status(404).json({ code: 404, message: '会员不存在', data: null });
    }
    if (member.points < product.points) {
      return res.status(400).json({ 
        code: 400, 
        message: `积分不足，需要 ${product.points} 积分，当前 ${member.points} 积分`, 
        data: null 
      });
    }

    member.points -= product.points;
    product.stock -= 1;

    const exchangeLog = new ExchangeLog({
      memberId: member._id,
      productId: product._id,
      productName: product.name,
      points: product.points
    });

    const pointsLog = new PointsLog({
      memberId: member._id,
      type: 'exchange',
      amount: product.points,
      description: `兑换商品：${product.name}`
    });

    await member.save();
    await product.save();
    await exchangeLog.save();
    await pointsLog.save();

    res.json({ code: 0, message: '兑换成功', data: { points: member.points } });
  } catch (error) {
    console.error('[Product] 兑换失败:', error);
    res.status(500).json({ code: 500, message: '兑换失败', data: null });
  }
});

router.get('/exchange-log/:memberId', async (req, res) => {
  try {
    const logs = await ExchangeLog.find({ memberId: req.params.memberId })
      .sort({ createdAt: -1 })
      .limit(50);
    res.json({ code: 0, message: '获取成功', data: logs });
  } catch (error) {
    console.error('[Product] 获取兑换记录失败:', error);
    res.status(500).json({ code: 500, message: '获取失败', data: null });
  }
});

router.get('/all', async (req, res) => {
  try {
    const products = await Product.find().sort({ points: 1 });
    res.json({ code: 0, message: '获取成功', data: products });
  } catch (error) {
    console.error('[Product] 获取全部商品失败:', error);
    res.status(500).json({ code: 500, message: '获取失败', data: null });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, description, points, image, stock } = req.body;
    if (!name || !points) {
      return res.status(400).json({ code: 400, message: '商品名称和积分不能为空', data: null });
    }
    const product = new Product({
      name,
      description: description || '',
      points,
      image: image || '',
      stock: stock || 999
    });
    await product.save();
    res.json({ code: 0, message: '创建成功', data: product });
  } catch (error) {
    console.error('[Product] 创建商品失败:', error);
    res.status(500).json({ code: 500, message: '创建失败', data: null });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { name, description, points, image, stock, status } = req.body;
    const updateData = { updatedAt: Date.now() };
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (points !== undefined) updateData.points = points;
    if (image !== undefined) updateData.image = image;
    if (stock !== undefined) updateData.stock = stock;
    if (status !== undefined) updateData.status = status;

    const product = await Product.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!product) {
      return res.status(404).json({ code: 404, message: '商品不存在', data: null });
    }
    res.json({ code: 0, message: '更新成功', data: product });
  } catch (error) {
    console.error('[Product] 更新商品失败:', error);
    res.status(500).json({ code: 500, message: '更新失败', data: null });
  }
});

module.exports = router;
