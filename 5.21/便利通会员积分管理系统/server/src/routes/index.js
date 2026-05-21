const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({ code: 0, message: '便利通会员积分管理系统 API', data: null });
});

module.exports = router;
