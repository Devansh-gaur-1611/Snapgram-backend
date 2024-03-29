const Redis = require("ioredis");

class RedisServices {
  constructor() {
    this.redisUrl = process.env.REDIS_URL;
    this.redisUrlStatus = process.env.REDIS_URL_STATUS;
  }
  static createClient() {
    return new Redis(new RedisServices().redisUrl);
  }

  static createClientStatus() {
    return new Redis(new RedisServices().redisUrlStatus);
  }


  static async getUserStatus(userId, chatId) {
    const redisClientStatus = RedisServices.createClientStatus();
    try {
      const state = await redisClientStatus.hget(userId, chatId);
      return state != null ? parseInt(state) : 0;
    } finally {
      await redisClientStatus.quit();
    }
  }

  static async setUserStatus(userId, chatId, count) {
    const redisClientStatus = RedisServices.createClientStatus();
    if (count === 0) {
      await redisClientStatus.hdel(userId, chatId).then(() => redisClientStatus.quit());
    } else {
      await redisClientStatus.hincrby(userId, chatId, count).then(() => redisClientStatus.quit());
    }
  }
}

module.exports = RedisServices;
