// src/validators/payrollValidator.js
const Joi = require('joi');
const xss = require('xss-clean');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const createPayrollSchema = Joi.object({
  employee_name: Joi.string().min(2).max(100).required(),
  salary: Joi.number().positive().max(10000000).required(),
  pay_date: Joi.date().iso().required()
});

module.exports = {
  validateCreatePayroll: (data) => createPayrollSchema.validate(data)
};

app.use(helmet()); // Headers de seguridad
app.use(xss()); // Prevenir XSS

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100 // 100 requests por IP
});
app.use('/api/', limiter);
