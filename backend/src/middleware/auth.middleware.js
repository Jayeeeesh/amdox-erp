const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const User = require('../models/user.model');
const { verifyAccessToken } = require('../utils/jwt');

// Protect routes - verify JWT token
const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Get token from Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  // Fallback to cookie
  if (!token && req.cookies?.accessToken) {
    token = req.cookies.accessToken;
  }

  if (!token) {
    throw new ApiError('Not authorized, no token', 401);
  }

  // Verify token
  let decoded;
  try {
    decoded = verifyAccessToken(token);
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      throw new ApiError('Token expired, please refresh', 401);
    }
    throw new ApiError('Not authorized, invalid token', 401);
  }

  // Find user
  const user = await User.findById(decoded.id).select(
    '-refreshToken'
  );

  if (!user) {
    throw new ApiError('User no longer exists', 401);
  }

  // Check active
  if (!user.isActive) {
    throw new ApiError('Account is deactivated', 403);
  }

  // Check soft delete
  if (user.deletedAt) {
    throw new ApiError('Account has been deleted', 403);
  }

  // Attach user to request
  req.user = user;

  next();
});

// Authorize specific roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new ApiError(
        `Access denied. Role '${req.user.role}' is not authorized to access this route`,
        403
      );
    }
    next();
  };
};

// Admin only shortcut
const adminOnly = authorize('admin');

// Admin and Manager shortcut
const managerOnly = authorize('admin', 'manager');

module.exports = {
  protect,
  authorize,
  adminOnly,
  managerOnly,
};