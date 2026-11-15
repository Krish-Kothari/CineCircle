function sendSuccess(res, data, message = 'Request successful', statusCode = 200, meta = {}) {
  return res.status(statusCode).json({ success: true, message, data, ...meta });
}

function sendError(res, message, statusCode = 500, details) {
  const body = { success: false, message };
  if (details !== undefined) body.details = details;
  return res.status(statusCode).json(body);
}

module.exports = { sendSuccess, sendError };
