const express = require('express')
const router = express.Router()
const Member = require('../models/Member')
const PointRecord = require('../models/PointRecord')
const { memberLevels, getLevelByPoints } = require('../config/memberLevel')

router.get('/', (req, res) => {
  res.json({
    code: 200,
    message: 'Member API - 功能开发中',
    data: []
  })
})

router.get('/list', async (req, res) => {
  try {
    const { phone, page = 1, pageSize = 10 } = req.query

    let query = {}
    if (phone) {
      query.phone = phone
    }

    let members, total
    try {
      members = await Member.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * pageSize)
        .limit(parseInt(pageSize))
      
      total = await Member.countDocuments(query)
    } catch (dbError) {
      return res.error('查询会员列表失败')
    }

    res.success({
      list: members,
      total,
      page: parseInt(page),
      pageSize: parseInt(pageSize)
    }, '查询成功')
  } catch (error) {
    console.error('查询会员列表失败:', error)
    res.error('操作失败：' + error.message)
  }
})

router.post('/register', async (req, res) => {
  try {
    const { name, phone, level } = req.body

    if (!name || !phone) {
      return res.error('姓名和手机号不能为空')
    }

    const phoneRegex = /^1[3-9]\d{9}$/
    if (!phoneRegex.test(phone)) {
      return res.error('手机号格式不正确')
    }

    let existingMember
    try {
      existingMember = await Member.findOne({ phone })
    } catch (dbError) {
      console.error('数据库查询失败:', dbError.message)
      return res.error('数据库连接失败，请确保 MongoDB 服务已启动')
    }

    if (existingMember) {
      return res.error('该手机号已注册')
    }

    const member = new Member({
      name,
      phone,
      level: level || '普通会员'
    })

    try {
      await member.save()
    } catch (dbError) {
      console.error('数据保存失败:', dbError.message)
      return res.error('数据保存失败，请确保 MongoDB 服务已启动')
    }

    res.success({
      id: member._id,
      name: member.name,
      phone: member.phone,
      level: member.level
    }, '注册成功')
  } catch (error) {
    console.error('注册失败:', error)
    res.error('注册失败：' + error.message)
  }
})

router.post('/', (req, res) => {
  res.json({
    code: 200,
    message: '会员创建功能开发中',
    data: null
  })
})

router.put('/:id', (req, res) => {
  res.json({
    code: 200,
    message: '会员更新功能开发中',
    data: null
  })
})

router.delete('/:id', (req, res) => {
  res.json({
    code: 200,
    message: '会员删除功能开发中',
    data: null
  })
})

router.post('/:id/points/add', async (req, res) => {
  try {
    const { points, type, typeName, description, operator } = req.body
    const memberId = req.params.id

    if (!points || points <= 0) {
      return res.error('积分数值必须大于0')
    }

    let member
    try {
      member = await Member.findById(memberId)
    } catch (dbError) {
      return res.error('数据库查询失败，请确保 MongoDB 服务已启动')
    }

    if (!member) {
      return res.error('会员不存在')
    }

    const balanceBefore = member.points || 0
    const balanceAfter = balanceBefore + points

    member.points = balanceAfter
    member.updatedAt = Date.now()

    try {
      await member.save()
    } catch (dbError) {
      return res.error('会员积分更新失败')
    }

    const record = new PointRecord({
      memberId: member._id,
      memberName: member.name,
      memberPhone: member.phone,
      type: type || 'earn',
      typeName: typeName || '消费赠送',
      points: points,
      balanceBefore,
      balanceAfter,
      description: description || '',
      operator: operator || '系统'
    })

    try {
      await record.save()
    } catch (dbError) {
      return res.error('积分记录保存失败')
    }

    res.success({
      memberId: member._id,
      memberName: member.name,
      balanceBefore,
      pointsAdded: points,
      balanceAfter
    }, '积分增加成功')
  } catch (error) {
    console.error('积分增加失败:', error)
    res.error('操作失败：' + error.message)
  }
})

router.post('/:id/points/consume', async (req, res) => {
  try {
    const { points, type, typeName, description, operator } = req.body
    const memberId = req.params.id

    if (!points || points <= 0) {
      return res.error('积分数值必须大于0')
    }

    let member
    try {
      member = await Member.findById(memberId)
    } catch (dbError) {
      return res.error('数据库查询失败，请确保 MongoDB 服务已启动')
    }

    if (!member) {
      return res.error('会员不存在')
    }

    const balanceBefore = member.points || 0

    if (balanceBefore < points) {
      return res.error('积分不足，当前积分：' + balanceBefore)
    }

    const balanceAfter = balanceBefore - points

    member.points = balanceAfter
    member.updatedAt = Date.now()

    try {
      await member.save()
    } catch (dbError) {
      return res.error('会员积分更新失败')
    }

    const record = new PointRecord({
      memberId: member._id,
      memberName: member.name,
      memberPhone: member.phone,
      type: type || 'consume',
      typeName: typeName || '消费抵扣',
      points: points,
      balanceBefore,
      balanceAfter,
      description: description || '',
      operator: operator || '系统'
    })

    try {
      await record.save()
    } catch (dbError) {
      return res.error('积分记录保存失败')
    }

    res.success({
      memberId: member._id,
      memberName: member.name,
      balanceBefore,
      pointsConsumed: points,
      balanceAfter
    }, '积分抵扣成功')
  } catch (error) {
    console.error('积分抵扣失败:', error)
    res.error('操作失败：' + error.message)
  }
})

router.post('/signin/:memberId', async (req, res) => {
  try {
    const memberId = req.params.memberId
    const { points } = req.body
    const signInPoints = points || 10

    let member
    try {
      member = await Member.findById(memberId)
    } catch (dbError) {
      return res.error('数据库查询失败，请确保 MongoDB 服务已启动')
    }

    if (!member) {
      return res.error('会员不存在')
    }

    const balanceBefore = member.points || 0
    const balanceAfter = balanceBefore + signInPoints

    member.points = balanceAfter
    member.updatedAt = Date.now()

    try {
      await member.save()
    } catch (dbError) {
      return res.error('会员积分更新失败')
    }

    const record = new PointRecord({
      memberId: member._id,
      memberName: member.name,
      memberPhone: member.phone,
      type: 'signin',
      typeName: '每日签到',
      points: signInPoints,
      balanceBefore,
      balanceAfter,
      description: '每日签到赠送积分',
      operator: '系统'
    })

    try {
      await record.save()
    } catch (dbError) {
      return res.error('积分记录保存失败')
    }

    res.success({
      memberId: member._id,
      memberName: member.name,
      balanceBefore,
      pointsEarned: signInPoints,
      balanceAfter
    }, '签到成功，获得 ' + signInPoints + ' 积分')
  } catch (error) {
    console.error('签到失败:', error)
    res.error('操作失败：' + error.message)
  }
})

router.get('/:memberId/points/records', async (req, res) => {
  try {
    const memberId = req.params.memberId
    const { page = 1, pageSize = 20 } = req.query

    let records, total
    try {
      records = await PointRecord.find({ memberId })
        .sort({ createdAt: -1 })
        .skip((page - 1) * pageSize)
        .limit(parseInt(pageSize))
      
      total = await PointRecord.countDocuments({ memberId })
    } catch (dbError) {
      return res.error('查询积分记录失败')
    }

    res.success({
      list: records,
      total,
      page: parseInt(page),
      pageSize: parseInt(pageSize)
    }, '查询成功')
  } catch (error) {
    console.error('查询积分记录失败:', error)
    res.error('操作失败：' + error.message)
  }
})

router.get('/points/records', async (req, res) => {
  try {
    const { page = 1, pageSize = 20, memberPhone, type } = req.query

    let query = {}
    if (memberPhone) {
      query.memberPhone = memberPhone
    }
    if (type) {
      query.type = type
    }

    let records, total
    try {
      records = await PointRecord.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * pageSize)
        .limit(parseInt(pageSize))
      
      total = await PointRecord.countDocuments(query)
    } catch (dbError) {
      return res.error('查询积分记录失败')
    }

    res.success({
      list: records,
      total,
      page: parseInt(page),
      pageSize: parseInt(pageSize)
    }, '查询成功')
  } catch (error) {
    console.error('查询积分记录失败:', error)
    res.error('操作失败：' + error.message)
  }
})

router.get('/levels/config', (req, res) => {
  res.success(memberLevels, '查询成功')
})

router.get('/expiring-soon', async (req, res) => {
  try {
    const { days = 7 } = req.query
    const now = new Date()
    const futureDate = new Date(now.getTime() + parseInt(days) * 24 * 60 * 60 * 1000)

    let members
    try {
      members = await Member.find({
        expireDate: {
          $gte: now,
          $lte: futureDate
        },
        status: 1
      }).sort({ expireDate: 1 })
    } catch (dbError) {
      return res.error('查询即将到期会员失败')
    }

    const result = members.map(m => ({
      ...m.toObject(),
      daysToExpire: m.getDaysToExpire(),
      isExpiringSoon: m.isExpiringSoon(parseInt(days))
    }))

    res.success({
      list: result,
      total: result.length
    }, '查询成功')
  } catch (error) {
    console.error('查询即将到期会员失败:', error)
    res.error('操作失败：' + error.message)
  }
})

router.get('/expired', async (req, res) => {
  try {
    let members
    try {
      members = await Member.find({
        expireDate: {
          $lt: new Date()
        },
        status: 1
      }).sort({ expireDate: -1 })
    } catch (dbError) {
      return res.error('查询已过期会员失败')
    }

    const result = members.map(m => ({
      ...m.toObject(),
      daysExpired: Math.abs(m.getDaysToExpire()),
      isExpired: m.isExpired()
    }))

    res.success({
      list: result,
      total: result.length
    }, '查询成功')
  } catch (error) {
    console.error('查询已过期会员失败:', error)
    res.error('操作失败：' + error.message)
  }
})

router.get('/export', async (req, res) => {
  try {
    const { type = 'members', memberPhone } = req.query

    let data = []
    
    if (type === 'members') {
      let query = {}
      if (memberPhone) {
        query.phone = memberPhone
      }
      try {
        data = await Member.find(query).sort({ createdAt: -1 })
      } catch (dbError) {
        return res.error('导出会员数据失败')
      }
    } else if (type === 'points') {
      let query = {}
      if (memberPhone) {
        query.memberPhone = memberPhone
      }
      try {
        data = await PointRecord.find(query).sort({ createdAt: -1 })
      } catch (dbError) {
        return res.error('导出积分记录失败')
      }
    }

    res.success({
      data,
      count: data.length
    }, '导出成功')
  } catch (error) {
    console.error('导出数据失败:', error)
    res.error('操作失败：' + error.message)
  }
})

router.put('/:id', async (req, res) => {
  try {
    const memberId = req.params.id
    const { name, phone, level, expireDate, status, remark } = req.body

    let member
    try {
      member = await Member.findById(memberId)
    } catch (dbError) {
      return res.error('查询会员失败')
    }

    if (!member) {
      return res.error('会员不存在')
    }

    if (phone && phone !== member.phone) {
      let existingMember
      try {
        existingMember = await Member.findOne({ phone, _id: { $ne: memberId } })
      } catch (dbError) {
        return res.error('验证手机号失败')
      }
      if (existingMember) {
        return res.error('该手机号已被使用')
      }
      member.phone = phone
    }

    if (name) member.name = name
    if (level) member.level = level
    if (expireDate) member.expireDate = expireDate
    if (status !== undefined) member.status = status
    if (remark !== undefined) member.remark = remark

    try {
      await member.save()
    } catch (dbError) {
      return res.error('更新会员信息失败')
    }

    res.success(member, '更新成功')
  } catch (error) {
    console.error('更新会员信息失败:', error)
    res.error('操作失败：' + error.message)
  }
})

router.get('/:id', async (req, res) => {
  try {
    const memberId = req.params.id

    let member
    try {
      member = await Member.findById(memberId)
    } catch (dbError) {
      return res.error('查询会员失败')
    }

    if (!member) {
      return res.error('会员不存在')
    }

    const result = member.toObject()
    result.daysToExpire = member.getDaysToExpire()
    result.isExpired = member.isExpired()
    result.isExpiringSoon = member.isExpiringSoon()

    res.success(result, '查询成功')
  } catch (error) {
    console.error('查询会员详情失败:', error)
    res.error('操作失败：' + error.message)
  }
})

module.exports = router
