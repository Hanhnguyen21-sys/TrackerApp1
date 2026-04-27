import express from 'express';
import protect from '../middleware/auth.middleware.js';
import { getNotifications, markNotificationRead } from '../controllers/notification.controller.js';

const router = express.Router();

router.get('/', protect, getNotifications);
router.patch('/:notificationId/read', protect, markNotificationRead);

export default router;
