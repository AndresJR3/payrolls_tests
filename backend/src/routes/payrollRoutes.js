// backend/src/routes/payrollRoutes.js
const express = require('express');
const router = express.Router();
const {
  getAllPayrolls,
  getPayrollById,
  createPayroll,
  updatePayroll,
  deletePayroll,
  getPayrollStats
} = require('../controllers/payrollController');
const { authenticateToken } = require('../middleware/auth');

// Aplicamos el middleware de autenticación a TODAS las rutas de nóminas.
// Esto asegura que solo usuarios con un token válido puedan acceder a ellas.
router.use(authenticateToken);

// Rutas para las nóminas
router.get('/', getAllPayrolls);
router.post('/', createPayroll);
router.get('/stats', getPayrollStats); // Ruta para estadísticas
router.get('/:id', getPayrollById);
router.put('/:id', updatePayroll);
router.delete('/:id', deletePayroll);

module.exports = router;
