import express from 'express';
import { searchUsers } from '../controllers/user.controller.js';
import protect from '../middleware/auth.middleware.js';

const router = express.Router();

// Search users by username or email
router.get('/search', protect, searchUsers);

export default router;