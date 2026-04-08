import express from 'express';
import { searchUserByEmail } from '../controllers/user.controller.js';
import protect from '../middleware/auth.middleware.js';

const router = express.Router();

// Search user by email
router.get("/search", protect, searchUserByEmail);

export default router;