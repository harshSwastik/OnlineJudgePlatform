const redisClient = require('../config/redis');

// Wrap the middleware in a function that accepts configuration
const rateLimiter = (actionName, maxRequests, windowSizeInSeconds) => {
  
  // Return the actual Express middleware function
  return async (req, res, next) => {
    try {
      const identifier = req.user?.id || req.ip;
      
      // The key is now dynamic based on the route it's attached to
      const redisKey = `rate_limit:${actionName}:${identifier}`;
      
      const currentRequests = await redisClient.incr(redisKey);
      
      if (currentRequests === 1) {
        await redisClient.expire(redisKey, windowSizeInSeconds);
      }
      
      if (currentRequests > maxRequests) {
        return res.status(429).json({
          message: `Too many requests for ${actionName}. Please wait and try again.`
        });
      }
      
      next();
    } catch (error) {
      console.error(`Rate Limiter Error on ${actionName}:`, error);
      next(); 
    }
  };
};

module.exports = rateLimiter;