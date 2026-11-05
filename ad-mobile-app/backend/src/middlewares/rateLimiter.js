const requestBuckets = new Map();

function createRateLimiter({ windowMs = 60 * 1000, maxRequests = 30 } = {}) {
  return (req, res, next) => {
    const clientKey = `${req.ip}:${req.baseUrl}`;
    const now = Date.now();

    const bucket = requestBuckets.get(clientKey) || { count: 0, resetTime: now + windowMs };

    if (now > bucket.resetTime) {
      bucket.count = 1;
      bucket.resetTime = now + windowMs;
    } else {
      bucket.count += 1;
    }

    requestBuckets.set(clientKey, bucket);

    if (bucket.count > maxRequests) {
      return res.status(429).json({
        success: false,
        message: 'Too many requests. Please wait a moment before trying again.'
      });
    }

    next();
  };
}

module.exports = { createRateLimiter };
