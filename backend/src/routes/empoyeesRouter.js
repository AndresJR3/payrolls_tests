const express = require('express');
const EmployeeService = require('../services/employeesService');
const validatorHandler = require('../middlewares/validatorHandler');
const { createEmployeeSchema, updateEmployeeSchema, id } = require('../schemas/employeeSchema');

const router = express.Router();
const service = new EmployeeService();

router.get('/', async (req, res) => {
  const employees = await service.getAll();
  res.json(employees);
});

router.get('/:id',
  validatorHandler(id, 'params'),
  async (req, res) => {
    const { id } = req.params;
    const employee = await service.getById(parseInt(id));
    res.json(employee);
  }
);

router.post('/',
  validatorHandler(createEmployeeSchema, 'body'),
  async (req, res) => {
    const newEmployee = await service.create(req.body);
    res.status(201).json(newEmployee);
  }
);

router.patch('/:id',
  validatorHandler(id, 'params'),
  validatorHandler(updateEmployeeSchema, 'body'),
  async (req, res) => {
    const updated = await service.update(parseInt(req.params.id), req.body);
    res.json(updated);
  }
);

module.exports = router;
