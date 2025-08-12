import express from 'express';
import {
  deleteUser,
  getAllUsers,
  getUserById,
  updateUser
} from '../controllers/admin.controller.js';

import { authMiddleware, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

// All routes are protected for Admins only
router.use(authMiddleware, authorize('admin'));

// Get all users
router.get('/users', getAllUsers);

// Get a specific user by ID
router.get('/users/:id', getUserById);

// Update a user
router.put('/users/:id', updateUser);

// Delete a user
router.delete('/users/:id', deleteUser);

export default router;
