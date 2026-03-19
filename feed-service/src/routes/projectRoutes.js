const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const { createProject, getProjects, addCollaborator, uploadDocuments } = require('../controllers/projectController');

const router = express.Router();

router.use(authMiddleware);

router.get('/', getProjects);
router.post('/', createProject);
router.post('/:projectId/collaborators', addCollaborator);
router.post('/:projectId/documents', uploadDocuments);

module.exports = router;
