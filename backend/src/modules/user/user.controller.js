const mongoose = require('mongoose');
const User = require('../../models/user.model');
const asyncHandler = require('../../utils/asyncHandler');
const ApiError = require('../../utils/ApiError');
const ApiResponse = require('../../utils/ApiResponse');

// Helper
const isValidId = (id) =>
  mongoose.Types.ObjectId.isValid(id);

// ======================
// Get All Users
// ======================
const getUsers = asyncHandler(async (req, res) => {
  let {
    page = 1,
    limit = 10,
    role,
    isActive,
    search,
  } = req.query;

  page = Number(page);
  limit = Number(limit);

  if (page < 1 || limit < 1) {
    throw new ApiError('Invalid pagination', 400);
  }

  const query = { deletedAt: null };

  if (role) query.role = role;
  if (isActive !== undefined) {
    query.isActive = isActive === 'true';
  }
  if (search) query.$text = { $search: search };

  const [users, total] = await Promise.all([
    User.find(query)
      .select('-refreshToken')
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 })
      .lean(),

    User.countDocuments(query),
  ]);

  res.status(200).json(
    new ApiResponse(
      200,
      'Users fetched',
      users,
      {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      }
    )
  );
});

// ======================
// Get Single User
// ======================
const getUser = asyncHandler(async (req, res) => {
  if (!isValidId(req.params.id)) {
    throw new ApiError('Invalid user id', 400);
  }

  const user = await User
    .findById(req.params.id)
    .select('-refreshToken')
    .lean();

  if (!user || user.deletedAt) {
    throw new ApiError('User not found', 404);
  }

  res.status(200).json(
    new ApiResponse(200, 'User fetched', user)
  );
});

// ======================
// Get Current User Profile
// ======================
const getMe = asyncHandler(async (req, res) => {
  const user = await User
    .findById(req.user._id)
    .select('-refreshToken')
    .lean();

  res.status(200).json(
    new ApiResponse(200, 'Profile fetched', user)
  );
});

// ======================
// Update Current User Profile
// ======================
const updateMe = asyncHandler(async (req, res) => {
  // Prevent sensitive field changes
  delete req.body.role;
  delete req.body.isActive;
  delete req.body.password;
  delete req.body.refreshToken;

  const user = await User.findById(req.user._id);

  if (!user) {
    throw new ApiError('User not found', 404);
  }

  // Email duplicate check
  if (
    req.body.email &&
    req.body.email !== user.email
  ) {
    const exists = await User.findOne({
      email: req.body.email,
    });
    if (exists) {
      throw new ApiError('Email already exists', 409);
    }
  }

  Object.assign(user, req.body);
  await user.save();

  res.status(200).json(
    new ApiResponse(200, 'Profile updated', user)
  );
});

// ======================
// Change Password
// ======================
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User
    .findById(req.user._id)
    .select('+password');

  if (!user) {
    throw new ApiError('User not found', 404);
  }

  // Verify current password
  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    throw new ApiError('Current password is incorrect', 401);
  }

  // New password must be different
  if (currentPassword === newPassword) {
    throw new ApiError(
      'New password must be different from current password',
      400
    );
  }

  user.password = newPassword;
  // Invalidate refresh token on password change
  user.refreshToken = null;
  await user.save();

  res.status(200).json(
    new ApiResponse(200, 'Password changed successfully')
  );
});

// ======================
// Update User (Admin)
// ======================
const updateUser = asyncHandler(async (req, res) => {
  if (!isValidId(req.params.id)) {
    throw new ApiError('Invalid user id', 400);
  }

  // Prevent password change via this route
  delete req.body.password;
  delete req.body.refreshToken;

  const user = await User.findById(req.params.id);

  if (!user || user.deletedAt) {
    throw new ApiError('User not found', 404);
  }

  // Email duplicate check
  if (
    req.body.email &&
    req.body.email !== user.email
  ) {
    const exists = await User.findOne({
      email: req.body.email,
    });
    if (exists) {
      throw new ApiError('Email already exists', 409);
    }
  }

  Object.assign(user, req.body);
  await user.save();

  res.status(200).json(
    new ApiResponse(200, 'User updated', user)
  );
});

// ======================
// Delete User (Soft)
// ======================
const deleteUser = asyncHandler(async (req, res) => {
  if (!isValidId(req.params.id)) {
    throw new ApiError('Invalid user id', 400);
  }

  // Prevent self delete
  if (req.params.id === req.user._id.toString()) {
    throw new ApiError(
      'Cannot delete your own account',
      400
    );
  }

  const user = await User.findById(req.params.id);

  if (!user || user.deletedAt) {
    throw new ApiError('User not found', 404);
  }

  user.isActive = false;
  user.deletedAt = new Date();
  user.refreshToken = null;
  await user.save();

  res.status(200).json(
    new ApiResponse(200, 'User deleted')
  );
});

// ======================
// Restore User (Admin)
// ======================
const restoreUser = asyncHandler(async (req, res) => {
  if (!isValidId(req.params.id)) {
    throw new ApiError('Invalid user id', 400);
  }

  const user = await User.findById(req.params.id);

  if (!user || !user.deletedAt) {
    throw new ApiError('User not found', 404);
  }

  user.isActive = true;
  user.deletedAt = null;
  await user.save();

  res.status(200).json(
    new ApiResponse(200, 'User restored', user)
  );
});

module.exports = {
  getUsers,
  getUser,
  getMe,
  updateMe,
  changePassword,
  updateUser,
  deleteUser,
  restoreUser,
};