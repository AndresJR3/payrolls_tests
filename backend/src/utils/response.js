function successResponse(res, data, message = 'OK', status = 200) {
  res.status(status).json({
    success: true,
    message,
    data
  });
}

function errorResponse(res, message = 'Error interno', status = 500) {
  res.status(status).json({
    success: false,
    message
  });
}

module.exports = { successResponse, errorResponse };
