
function errorHandler(err, req, res, next) {
  console.error(`[Error] ${req.method} ${req.originalUrl}:`, err.message);

  if (err.code === 'P2002') {
    return res.status(409).json({
      success: false,
      message: 'Duplicate entry violates a unique database constraint',
      target: err.meta?.target || []
    });
  }

  const statusCode = err.statusCode || 500;
  return res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
}

module.exports = errorHandler;
