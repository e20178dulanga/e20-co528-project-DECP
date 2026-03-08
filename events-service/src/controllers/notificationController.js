const Notification = require('../models/Notification');

// ── GET /api/notifications  (own, unread first) ───────────────
const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user.id })
      .sort({ isRead: 1, createdAt: -1 }) // unread (isRead=false=0) first
      .limit(50);

    const unreadCount = await Notification.countDocuments({
      recipient: req.user.id,
      isRead: false,
    });

    return res.status(200).json({ unreadCount, total: notifications.length, notifications });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// ── PATCH /api/notifications/:id/read ────────────────────────
const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user.id }, // ensure own notification
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found.' });
    }
    return res.status(200).json({ notification });
  } catch (error) {
    if (error.name === 'CastError') return res.status(400).json({ message: 'Invalid notification ID.' });
    return res.status(500).json({ message: error.message });
  }
};

// ── PATCH /api/notifications/read-all ────────────────────────
const markAllAsRead = async (req, res) => {
  try {
    const result = await Notification.updateMany(
      { recipient: req.user.id, isRead: false },
      { isRead: true }
    );
    return res.status(200).json({
      message: `Marked ${result.modifiedCount} notification(s) as read.`,
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = { getNotifications, markAsRead, markAllAsRead };
