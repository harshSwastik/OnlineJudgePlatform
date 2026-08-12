const { createClient } = require('redis');

const RedisClient  = createClient({ 
    username: 'default',
     password: process.env.REDIS_PASS, 
    socket: {
        host: 'need-neosmart-salt-14401.db.redis.io',
        port: 18040
    }
});

module.exports = RedisClient; 


