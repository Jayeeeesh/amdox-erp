const mongoose = require('mongoose');
const Transaction = require('../../models/transaction.model');
const asyncHandler = require('../../utils/asyncHandler');
const ApiError = require('../../utils/ApiError');
const ApiResponse = require('../../utils/ApiResponse');

// Helper - validate ObjectId
const isValidId = (id) =>
  mongoose.Types.ObjectId.isValid(id);

// @desc    Get all transactions
// @route   GET /api/v1/finance/transactions
// @access  Private/Manager
const getTransactions = asyncHandler(async (req, res) => {
  let {
    page = 1,
    limit = 10,
    type,
    category,
    search,
    startDate,
    endDate,
  } = req.query;

  page = Number(page);
  limit = Number(limit);

  if (page < 1 || limit < 1) {
    throw new ApiError('Invalid pagination', 400);
  }

  const query = {};

  if (type) query.type = type;
  if (category) query.category = category;
  if (search) query.$text = { $search: search };

  // Date range filter
  if (startDate || endDate) {
    query.date = {};
    if (startDate) query.date.$gte = new Date(startDate);
    if (endDate) query.date.$lte = new Date(endDate);
  }

  // Run queries in parallel
  const [transactions, total, summary] = await Promise.all([
    Transaction
      .find(query)
      .active()
      .populate('createdBy', 'name email')
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ date: -1 })
      .lean(),

    Transaction.countDocuments({
      ...query,
      isDeleted: false,
    }),

    Transaction.aggregate([
      { $match: { ...query, isDeleted: false } },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
    ]),
  ]);

  res.status(200).json(
    new ApiResponse(
      200,
      'Transactions fetched',
      { transactions, summary },
      {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      }
    )
  );
});

// @desc    Get single transaction
// @route   GET /api/v1/finance/transactions/:id
// @access  Private/Manager
const getTransaction = asyncHandler(async (req, res) => {
  if (!isValidId(req.params.id)) {
    throw new ApiError('Invalid transaction id', 400);
  }

  const transaction = await Transaction
    .findById(req.params.id)
    .populate('createdBy', 'name email')
    .lean();

  if (!transaction || transaction.isDeleted) {
    throw new ApiError('Transaction not found', 404);
  }

  res.status(200).json(
    new ApiResponse(200, 'Transaction fetched', transaction)
  );
});

// @desc    Create transaction
// @route   POST /api/v1/finance/transactions
// @access  Private/Manager
const createTransaction = asyncHandler(async (req, res) => {
  const transaction = await Transaction.create({
    ...req.body,
    createdBy: req.user._id,
  });

  await transaction.populate('createdBy', 'name email');

  res.status(201).json(
    new ApiResponse(201, 'Transaction created', transaction)
  );
});

// @desc    Update transaction
// @route   PATCH /api/v1/finance/transactions/:id
// @access  Private/Admin
const updateTransaction = asyncHandler(async (req, res) => {
  if (!isValidId(req.params.id)) {
    throw new ApiError('Invalid transaction id', 400);
  }

  const transaction = await Transaction.findById(req.params.id);

  if (!transaction || transaction.isDeleted) {
    throw new ApiError('Transaction not found', 404);
  }

  Object.assign(transaction, req.body);
  await transaction.save();

  res.status(200).json(
    new ApiResponse(200, 'Transaction updated', transaction)
  );
});

// @desc    Delete transaction (soft)
// @route   DELETE /api/v1/finance/transactions/:id
// @access  Private/Admin
const deleteTransaction = asyncHandler(async (req, res) => {
  if (!isValidId(req.params.id)) {
    throw new ApiError('Invalid transaction id', 400);
  }

  const transaction = await Transaction.findById(req.params.id);

  if (!transaction || transaction.isDeleted) {
    throw new ApiError('Transaction not found', 404);
  }

  await transaction.softDelete();

  res.status(200).json(
    new ApiResponse(200, 'Transaction deleted')
  );
});

// @desc    Restore transaction
// @route   PATCH /api/v1/finance/transactions/:id/restore
// @access  Private/Admin
const restoreTransaction = asyncHandler(async (req, res) => {
  if (!isValidId(req.params.id)) {
    throw new ApiError('Invalid transaction id', 400);
  }

  const transaction = await Transaction.findById(req.params.id);

  if (!transaction || !transaction.isDeleted) {
    throw new ApiError('Transaction not found', 404);
  }

  await transaction.restore();

  res.status(200).json(
    new ApiResponse(200, 'Transaction restored', transaction)
  );
});

// @desc    Get finance summary
// @route   GET /api/v1/finance/summary
// @access  Private/Manager
const getSummary = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;

  const match = { isDeleted: false };

  if (startDate || endDate) {
    match.date = {};
    if (startDate) match.date.$gte = new Date(startDate);
    if (endDate) match.date.$lte = new Date(endDate);
  }

  const summary = await Transaction.aggregate([
    { $match: match },
    {
      $group: {
        _id: '$type',
        total: { $sum: '$amount' },
        count: { $sum: 1 },
        avg: { $avg: '$amount' },
      },
    },
  ]);

  // Calculate net balance
  const income = summary.find(s => s._id === 'income')?.total || 0;
  const expense = summary.find(s => s._id === 'expense')?.total || 0;
  const netBalance = income - expense;

  res.status(200).json(
    new ApiResponse(200, 'Finance summary', {
      summary,
      netBalance,
      income,
      expense,
    })
  );
});

module.exports = {
  getTransactions,
  getTransaction,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  restoreTransaction,
  getSummary,
};