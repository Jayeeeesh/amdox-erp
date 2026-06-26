const User = require('../../models/user.model');
const Employee = require('../../models/employee.model');
const Transaction = require('../../models/transaction.model');
const PurchaseOrder = require('../../models/purchaseOrder.model');
const asyncHandler = require('../../utils/asyncHandler');
const ApiResponse = require('../../utils/ApiResponse');

/**
 * @desc    Get dashboard overview
 * @route   GET /api/v1/dashboard
 * @access  Private/Manager
 */
const getDashboard = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;

  // Date filter
  const dateFilter = {};
  if (startDate || endDate) {
    dateFilter.createdAt = {};
    if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
    if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
  }

  const [
    totalUsers,
    activeUsers,
    totalEmployees,
    activeEmployees,
    totalTransactions,
    financeSummary,
    monthlySummary,
    orderSummary,
    recentTransactions,
    recentOrders,
  ] = await Promise.all([

    // Total users
    User.countDocuments({ deletedAt: null }),

    // Active users
    User.countDocuments({
      isActive: true,
      deletedAt: null,
    }),

    // Total employees
    Employee.countDocuments({ deletedAt: null }),

    // Active employees
    Employee.countDocuments({
      isActive: true,
      deletedAt: null,
    }),

    // Total transactions
    Transaction.countDocuments({
      isDeleted: false,
      ...dateFilter,
    }),

    // Finance summary by type
    Transaction.aggregate([
      {
        $match: {
          isDeleted: false,
          ...dateFilter,
        },
      },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
          avg: { $avg: '$amount' },
        },
      },
    ]),

    // Monthly finance summary
    Transaction.aggregate([
      {
        $match: {
          isDeleted: false,
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
            type: '$type',
          },
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 12 },
    ]),

    // Order summary by status
    PurchaseOrder.aggregate([
      {
        $match: {
          isDeleted: false,
          ...dateFilter,
        },
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$totalAmount' },
        },
      },
    ]),

    // Recent transactions
    Transaction.find({
      isDeleted: false,
    })
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean(),

    // Recent orders
    PurchaseOrder.find({
      isDeleted: false,
    })
      .populate('createdBy', 'name email')
      .populate('approvedBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean(),
  ]);

  // Calculate net balance
  const income = financeSummary.find(
    (s) => s._id === 'income'
  )?.total || 0;

  const expense = financeSummary.find(
    (s) => s._id === 'expense'
  )?.total || 0;

  const netBalance = Number(
    (income - expense).toFixed(2)
  );

  // Department wise employee count
  const departmentSummary = await Employee.aggregate([
    { $match: { isActive: true, deletedAt: null } },
    {
      $group: {
        _id: '$department',
        count: { $sum: 1 },
        avgSalary: { $avg: '$salary' },
      },
    },
    { $sort: { count: -1 } },
  ]);

  res.status(200).json(
    new ApiResponse(200, 'Dashboard fetched', {
      stats: {
        users: {
          total: totalUsers,
          active: activeUsers,
          inactive: totalUsers - activeUsers,
        },
        employees: {
          total: totalEmployees,
          active: activeEmployees,
          inactive: totalEmployees - activeEmployees,
        },
        finance: {
          totalTransactions,
          income,
          expense,
          netBalance,
        },
        orders: {
          total: orderSummary.reduce(
            (sum, o) => sum + o.count, 0
          ),
          totalAmount: orderSummary.reduce(
            (sum, o) => sum + o.totalAmount, 0
          ),
        },
      },
      financeSummary,
      monthlySummary,
      orderSummary,
      departmentSummary,
      recentTransactions,
      recentOrders,
    })
  );
});

/**
 * @desc    Get finance chart data
 * @route   GET /api/v1/dashboard/finance-chart
 * @access  Private/Manager
 */
const getFinanceChart = asyncHandler(async (req, res) => {
  const { months = 6 } = req.query;

  const startDate = new Date();
  startDate.setMonth(
    startDate.getMonth() - Number(months)
  );

  const chartData = await Transaction.aggregate([
    {
      $match: {
        isDeleted: false,
        date: { $gte: startDate },
      },
    },
    {
      $group: {
        _id: {
          year: { $year: '$date' },
          month: { $month: '$date' },
          type: '$type',
        },
        total: { $sum: '$amount' },
      },
    },
    {
      $sort: {
        '_id.year': 1,
        '_id.month': 1,
      },
    },
  ]);

  res.status(200).json(
    new ApiResponse(200, 'Finance chart data', chartData)
  );
});

/**
 * @desc    Get order status chart
 * @route   GET /api/v1/dashboard/order-chart
 * @access  Private/Manager
 */
const getOrderChart = asyncHandler(async (req, res) => {
  const chartData = await PurchaseOrder.aggregate([
    { $match: { isDeleted: false } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalAmount: { $sum: '$totalAmount' },
      },
    },
  ]);

  res.status(200).json(
    new ApiResponse(200, 'Order chart data', chartData)
  );
});

module.exports = {
  getDashboard,
  getFinanceChart,
  getOrderChart,
};