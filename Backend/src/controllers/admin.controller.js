import User from '../models/user.model.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

// ✅ Get All Users
export const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select('-password -refreshTokens').lean();

  res
    .status(200)
    .json(new ApiResponse(200, users, 'Users retrieved successfully'));
});

// ✅ Get User By ID
export const getUserById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const user = await User.findById(id)
    .select('-password -refreshTokens')
    .lean();

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  res
    .status(200)
    .json(new ApiResponse(200, user, 'User retrieved successfully'));
});

// ✅ Update User (Admin Privileges)
export const updateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const updatedUser = await User.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true
  })
    .select('-password -refreshTokens')
    .lean();

  if (!updatedUser) {
    throw new ApiError(404, 'User not found');
  }

  res
    .status(200)
    .json(new ApiResponse(200, updatedUser, 'User updated successfully'));
});

// ✅ Delete User (Soft Delete Option Optional)
export const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const deletedUser = await User.findByIdAndDelete(id);

  if (!deletedUser) {
    throw new ApiError(404, 'User not found');
  }

  res.status(200).json(new ApiResponse(200, null, 'User deleted successfully'));
});

