const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const { getNotifications, markAsRead, markAllAsRead } = require('../controllers/notificationController');

const router = express.Router();

router.use(authMiddleware);

// ⚠️ read-all must be before /:id to avoid being matched as an ID
router.patch('/read-all', markAllAsRead);

router.get('/', getNotifications);
router.patch('/:id/read', markAsRead);

module.exports = router;
