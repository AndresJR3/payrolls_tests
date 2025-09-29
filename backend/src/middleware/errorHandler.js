// src/middleware/errorHandler.js
const errorHandler = (err, req, res, next) => {
  console.error('Error stack:', err.stack);

  // Error de validación
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Error de validación',
      message: err.message,
      details: err.errors
    });
  }

  // Error de JWT
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: 'Token inválido',
      message: 'El token proporcionado no es válido'
    });
  }

  // Error de token expirado
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      error: 'Token expirado',
      message: 'El token ha expirado, por favor inicia sesión nuevamente'
    });
  }

  // Error de duplicado en BD (violación de constraint unique)
  if (err.code === '23505') {
    return res.status(409).json({
      error: 'Recurso duplicado',
      message: 'El recurso que intentas crear ya existe'
    });
  }

  // Error de referencia foránea (constraint de FK)
  if (err.code === '23503') {
    return res.status(400).json({
      error: 'Referencia inválida',
      message: 'La referencia especificada no existe'
    });
  }

  // Error por defecto del servidor
  res.status(err.status || 500).json({
    error: 'Error interno del servidor',
    message: process.env.NODE_ENV === 'production'
      ? 'Ha ocurrido un error interno'
      : err.message
  });
};

module.exports = errorHandler;
