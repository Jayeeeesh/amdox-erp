const Joi = require('joi');
const transactionTypes = [
  'income',
  'expense',
  'transfer'
];
const categories = [
  'salary',
  'vendor',
  'operations',
  'tax',
  'other'
];
const createTransactionSchema = Joi.object({
  title: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .required()
    .messages({
      'string.empty': 'Title is required',
      'string.min': 'Title must be at least 2 characters'
    }),
  amount: Joi.number()
    .positive()
    .precision(2)
    .required()
    .messages({
      'number.positive': 'Amount must be greater than zero'
    }),
  type: Joi.string()
    .valid(...transactionTypes)
    .required(),
  category: Joi.string()
    .valid(...categories)
    .required(),
  date: Joi.date()
    .iso()
    .max('now')
    .default(() => new Date()),
  description: Joi.string()
    .trim()
    .max(500)
    .allow('', null),
  reference: Joi.string()
    .trim()
    .max(100)
    .allow('', null)
})
.strict();
const updateTransactionSchema = Joi.object({
  title: Joi.string()
    .trim()
    .min(2)
    .max(100),
  amount: Joi.number()
    .positive()
    .precision(2),
  type: Joi.string()
    .valid(...transactionTypes),
  category: Joi.string()
    .valid(...categories),
  date: Joi.date()
    .iso()
    .max('now'),
  description: Joi.string()
    .trim()
    .max(500)
    .allow('', null),
  reference: Joi.string()
    .trim()
    .max(100)
    .allow('', null)
})
.min(1)
.strict();
module.exports = {
  createTransactionSchema,
  updateTransactionSchema
};