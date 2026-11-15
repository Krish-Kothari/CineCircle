const requestBuckets = new Map();

function createRateLimiter({ windowMs = 60 * 1000, maxRequests = 30 } = {}) {
  return (req, res, next) => {
    const key = `${req.ip}:${req.baseUrl}`;
    const now = Date.now();
    let bucket = requestBuckets.get(key);
    if (!bucket || now >= bucket.resetTime) bucket = { count: 0, resetTime: now + windowMs };
    bucket.count += 1;
    requestBuckets.set(key, bucket);
    if (bucket.count > maxRequests) {
      return res.status(429).json({ success: false, message: 'Too many requests. Please wait a moment before trying again.' });
    }
    return next();
  };
}

module.exports = { createRateLimiter };
