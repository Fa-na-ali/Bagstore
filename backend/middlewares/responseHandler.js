const responseHandler = (res, statusCode, status, message, data = null) => {
  return res.status(statusCode).json({
    status,
    message,
    statusCode,
    data
  });
};

module.exports = responseHandler;