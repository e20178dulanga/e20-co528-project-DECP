const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');
const { getPendingUsers, approveUser, rejectUser, getAllUsersAdmin } = require('../controllers/adminController');

const router = express.Router();

// All admin routes require authentication + admin role
router.use(authMiddleware);
router.use(requireRole('admin'));

// GET  /api/admin/pending       — list pending registrations
router.get('/pending', getPendingUsers);

// GET  /api/admin/users         — list all users
router.get('/users', getAllUsersAdmin);

// PUT  /api/admin/approve/:id   — approve a user
router.put('/approve/:id', approveUser);

// PUT  /api/admin/reject/:id    — reject a user
router.put('/reject/:id', rejectUser);

module.exports = router;
