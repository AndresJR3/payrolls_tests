// backend/src/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const { register, login, getProfile } = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');

// Ruta para registrar un nuevo usuario (Pública)
router.post('/register', register);

// Ruta para iniciar sesión (Pública)
router.post('/login', login);

// Ruta para obtener el perfil del usuario (Protegida)
// Se necesita un token válido para acceder.
router.get('/profile', authenticateToken, getProfile);


module.exports = router;
