const redis = require('redis');

let redisClient = null;
let reconnectAttempts = 0;
const maxReconnectAttempts = 5;

const connectRedis = async () => {
  try {
    redisClient = redis.createClient({
      url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
      password: process.env.REDIS_PASSWORD || undefined,
    });

    redisClient.on('error', (err) => {
      if (reconnectAttempts < maxReconnectAttempts) {
        console.error('[Redis] 客户端错误:', err.message);
        reconnectAttempts++;
      } else if (reconnectAttempts === maxReconnectAttempts) {
        console.warn('[Redis] 连接失败次数过多，已停止重连。Redis 相关功能将不可用');
        reconnectAttempts++;
      }
    });
    redisClient.on('connect', () => {
      console.log('[Redis] 连接成功');
      reconnectAttempts = 0;
    });

    await redisClient.connect();
  } catch (error) {
    console.error('[Redis] 连接失败:', error.message);
    console.warn('[Redis] Redis 连接失败，Redis 相关功能将不可用');
  }
};

const getRedisClient = () => redisClient;

module.exports = { connectRedis, getRedisClient };
