const Joi = require('joi');

const id = Joi.number().integer().min(1);
const name = Joi.string().min(3).max(50);
const salary = Joi.number().min(1000);
const active = Joi.boolean();

const createEmployeeSchema = Joi.object({
  name: name.required(),
  salary: salary.required(),
  active: active.default(true)
});

const updateEmployeeSchema = Joi.object({
  name,
  salary,
  active
});

module.exports = { createEmployeeSchema, updateEmployeeSchema, id };
