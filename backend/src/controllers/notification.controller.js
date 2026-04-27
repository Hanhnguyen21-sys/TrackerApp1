import Notification from '../models/Notification.js';
import { sendError, sendSuccess } from '../utils/apiResponse.js';

export const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id })
      .populate('sender', 'username email')
      .populate('targetProject', 'name')
      .populate('targetTicket', 'title')
      .sort({ createdAt: -1 });

    return sendSuccess(res, { notifications }, 'Notifications fetched successfully');
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return sendError(res, 'Server error', 500);
  }
};

export const markNotificationRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const notification = await Notification.findById(notificationId);

    if (!notification) {
      return sendError(res, 'Notification not found', 404);
    }

    if (notification.recipient.toString() !== req.user._id.toString()) {
      return sendError(res, 'Not authorized to update this notification', 403);
    }

    notification.read = true;
    await notification.save();

    return sendSuccess(res, { notification }, 'Notification marked as read');
  } catch (error) {
    console.error('Error marking notification read:', error);
    return sendError(res, 'Server error', 500);
  }
};
