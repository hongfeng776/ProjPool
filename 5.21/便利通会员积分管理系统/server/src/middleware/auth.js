const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'bianlitong-secret-key';

const generateToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
};

const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

const authStaff = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ code: 401, message: '未登录', data: null });
  }

  const decoded = verifyToken(token);
  if (!decoded || decoded.type !== 'staff') {
    return res.status(401).json({ code: 401, message: '登录已过期，请重新登录', data: null });
  }

  req.staff = decoded;
  next();
};

const authAdmin = (req, res, next) => {
  if (!req.staff) {
    return res.status(401).json({ code: 401, message: '未登录', data: null });
  }
  if (req.staff.role !== 'admin') {
    return res.status(403).json({ code: 403, message: '权限不足，需要管理员权限', data: null });
  }
  next();
};

module.exports = { generateToken, verifyToken, authStaff, authAdmin };
