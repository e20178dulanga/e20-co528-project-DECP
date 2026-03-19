const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');
const {
  createJob, getJobs, getJobById, updateJob, deleteJob, closeJob, getJobStats
} = require('../controllers/jobController');

const router = express.Router();

// All routes require a valid JWT
router.use(authMiddleware);

// Public (authenticated) routes
router.get('/', getJobs);
router.get('/stats', requireRole('admin', 'alumni'), getJobStats);
router.get('/:id', getJobById);

// Alumni or admin only — create posting
router.post('/', requireRole('alumni', 'admin'), createJob);

// Poster-only operations (ownership checked inside controller)
router.put('/:id', requireRole('alumni', 'admin'), updateJob);
router.patch('/:id/close', requireRole('alumni', 'admin'), closeJob);

// Poster or admin — delete
router.delete('/:id', deleteJob);

module.exports = router;
