const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');
const {
  applyForJob, getApplicationsForJob, updateApplicationStatus, getMyApplications,
} = require('../controllers/applicationController');

const router = express.Router();

router.use(authMiddleware);

// View own applications (all roles)
router.get('/applications/mine', getMyApplications);

// Apply — student or alumni only
router.post('/jobs/:jobId/apply', requireRole('student', 'alumni'), applyForJob);

// View applications for a posting (ownership check inside controller)
router.get('/jobs/:jobId/applications', getApplicationsForJob);

// Update application status — poster only (ownership check inside controller)
router.patch('/jobs/:jobId/applications/:appId', updateApplicationStatus);

module.exports = router;
