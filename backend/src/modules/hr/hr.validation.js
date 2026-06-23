const Joi = require("joi");

const roles = ["admin", "manager", "employee"];

const phoneSchema = Joi.string()
  .trim()
  .pattern(/^[0-9]{10,15}$/)
  .messages({
    "string.pattern.base": "Phone must contain 10 to 15 digits",
  });

const createEmployeeSchema = Joi.object({
  name: Joi.string().trim().min(2).max(50).required(),

  email: Joi.string().trim().lowercase().email().required(),

  phone: phoneSchema.required(),

  department: Joi.string().trim().min(2).max(50).required(),

  designation: Joi.string().trim().min(2).max(50).required(),

  salary: Joi.number().integer().min(0).required(),
  joiningDate: Joi.alternatives()
    .try(Joi.date().iso(), Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/))
    .required(),

  role: Joi.string()
    .valid(...roles)
    .default("employee"),
}).strict();

const updateEmployeeSchema = Joi.object({
  name: Joi.string().trim().min(2).max(50),

  email: Joi.string().trim().lowercase().email(),

  phone: phoneSchema,

  department: Joi.string().trim().min(2).max(50),

  designation: Joi.string().trim().min(2).max(50),

  salary: Joi.number().integer().min(0),

  joiningDate: Joi.date().max("now"),

  role: Joi.string().valid(...roles),
})
  .min(1)
  .strict();

module.exports = {
  createEmployeeSchema,
  updateEmployeeSchema,
};
