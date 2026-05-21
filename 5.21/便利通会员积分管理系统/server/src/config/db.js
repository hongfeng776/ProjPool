const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('[MongoDB] 连接成功');
  } catch (error) {
    console.error('[MongoDB] 连接失败:', error.message);
    console.warn('[MongoDB] 数据库连接失败，API 参数校验仍可工作，但涉及数据库的操作将失败');
  }
};

module.exports = connectDB;
