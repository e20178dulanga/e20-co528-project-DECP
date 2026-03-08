const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const {
  createPost, createMediaPost, getPosts, getPostById,
  updatePost, deletePost, toggleLike, sharePost,
} = require('../controllers/postController');

const router = express.Router();

// All routes are JWT-protected
router.use(authMiddleware);

// Feed
router.get('/', getPosts);
router.get('/:id', getPostById);

// Create
router.post('/', createPost);
router.post('/media', createMediaPost);  // multipart/form-data

// Modify own post
router.put('/:id', updatePost);
router.delete('/:id', deletePost);

// Interactions
router.post('/:id/like', toggleLike);
router.post('/:id/share', sharePost);

module.exports = router;
