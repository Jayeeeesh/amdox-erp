const Joi = require('joi');

const updateUserSchema = Joi.object({
  name: Joi.string()
    .trim()
    .min(2)
    .max(50)
    .messages({
      'string.min': 'Name must be at least 2 characters',
      'string.max': 'Name cannot exceed 50 characters',
      'string.empty': 'Name cannot be empty',
    }),

  email: Joi.string()
    .trim()
    .lowercase()
    .email()
    .messages({
      'string.email': 'Please provide a valid email',
      'string.empty': 'Email cannot be empty',
    }),

  role: Joi.string()
    .valid('admin', 'manager', 'employee')
    .messages({
      'any.only': 'Role must be admin, manager or employee',
    }),

  isActive: Joi.boolean(),
})
  .min(1)
  .strict()
  .messages({
    'object.min': 'At least one field is required to update',
  });


const changePasswordSchema = Joi.object({
  currentPassword: Joi.string()
    .required()
    .messages({
      'string.empty': 'Current password is required',
      'any.required': 'Current password is required',
    }),

  newPassword: Joi.string()
    .min(8)
    .max(128)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).*$/)
    .required()
    .messages({
      'string.pattern.base':
        'Password must contain at least one uppercase letter, one lowercase letter and one number',
      'string.min': 'Password must be at least 8 characters',
      'string.max': 'Password cannot exceed 128 characters',
      'string.empty': 'New password is required',
      'any.required': 'New password is required',
    }),
})
  .strict();

module.exports = {
  updateUserSchema,
  changePasswordSchema,
};