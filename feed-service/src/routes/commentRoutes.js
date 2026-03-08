const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const { addComment, getComments, deleteComment } = require('../controllers/commentController');

// mergeParams allows access to :postId from the parent router
const router = express.Router({ mergeParams: true });

router.use(authMiddleware);

// GET  /api/posts/:postId/comments
router.get('/:postId/comments', getComments);

// POST /api/posts/:postId/comments
router.post('/:postId/comments', addComment);

// DELETE /api/posts/:postId/comments/:commentId
router.delete('/:postId/comments/:commentId', deleteComment);

module.exports = router;
