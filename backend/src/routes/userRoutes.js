const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');
const { getMe, updateMe, getUserById, getAllUsers, getUserStats, searchUsers } = require('../controllers/userController');

const router = express.Router();

// All routes below require a valid JWT
router.use(authMiddleware);

// GET  /api/users/me  – own profile
router.get('/me', getMe);

// PUT  /api/users/me  – update own profile
router.put('/me', updateMe);

// GET  /api/users     – list all users (admin only)
router.get('/', requireRole('admin'), getAllUsers);

// GET  /api/users/stats – get user statistics (admin and alumni)
router.get('/stats', requireRole('admin', 'alumni'), getUserStats);

// GET  /api/users/search – find users by name (public to authenticated)
router.get('/search', searchUsers);

// GET  /api/users/:id – get any user by ID (admin only)
router.get('/:id', requireRole('admin'), getUserById);

module.exports = router;
