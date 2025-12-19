import Notification from './notification.model.js';
import { emitEvent } from '../../server.js';

// POST /api/notifications — Create a notification
export const createNotification = async (req, res) => {
  try {
    const { receiver, type, message, projectId, relatedUser } = req.body || {};

    if (!receiver || !message) {
      return res.status(400).json({ message: 'Receiver and message required' });
    }

    const notification = await Notification.create({
      receiver,
      type,
      message,
      projectId,
      relatedUser,
    });

    // Realtime push to receiver
    emitEvent('notification:new', receiver, { type, message, projectId, relatedUser, _id: notification._id });

    return res.status(201).json({ message: 'Notification created', notification });
  } catch (err) {
    console.error('createNotification error:', err);
    return res.status(500).json({ message: 'Error creating notification' });
  }
};

// GET /api/notifications/me — Get logged-in user notifications
export const getMyNotifications = async (req, res) => {
  try {
    const userId = req.user.id || req.user.userId;
    const notifications = await Notification.find({ receiver: userId })
      .populate('relatedUser', 'username email')
      .populate('projectId', 'title status')
      .sort({ createdAt: -1 });

    return res.json({ notifications });
  } catch (err) {
    console.error('getMyNotifications error:', err);
    return res.status(500).json({ message: 'Error fetching notifications' });
  }
};

// POST /api/notifications/:id/read — Mark notification as read
export const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id || req.user.userId;

    const notification = await Notification.findById(id);
    if (!notification) return res.status(404).json({ message: 'Notification not found' });
    if (notification.receiver.toString() !== userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    notification.isRead = true;
    await notification.save();
    return res.json({ message: 'Notification marked as read', notification });
  } catch (err) {
    console.error('markAsRead error:', err);
    return res.status(500).json({ message: 'Error updating notification' });
  }
};
