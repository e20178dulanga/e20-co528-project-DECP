const Comment = require('../models/Comment');
const Post = require('../models/Post');

// ── POST /api/posts/:postId/comments ─────────────────────────
const addComment = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ message: 'Post not found.' });

    const { content } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'Comment content is required.' });
    }

    const comment = await Comment.create({
      post: post._id,
      author: req.user.id,
      authorName: req.user.name,
      content: content.trim(),
    });

    // Increment comment count on parent post
    await Post.findByIdAndUpdate(post._id, { $inc: { commentCount: 1 } });

    return res.status(201).json({ comment });
  } catch (error) {
    if (error.name === 'CastError') return res.status(400).json({ message: 'Invalid post ID.' });
    return res.status(500).json({ message: error.message });
  }
};

// ── GET /api/posts/:postId/comments ──────────────────────────
const getComments = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ message: 'Post not found.' });

    const comments = await Comment.find({ post: post._id }).sort({ createdAt: 1 });
    return res.status(200).json({ count: comments.length, comments });
  } catch (error) {
    if (error.name === 'CastError') return res.status(400).json({ message: 'Invalid post ID.' });
    return res.status(500).json({ message: error.message });
  }
};

// ── DELETE /api/posts/:postId/comments/:commentId ────────────
const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) return res.status(404).json({ message: 'Comment not found.' });

    // Only author can delete their comment
    if (comment.author.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You can only delete your own comments.' });
    }

    await comment.deleteOne();

    // Decrement comment count on parent post
    await Post.findByIdAndUpdate(req.params.postId, { $inc: { commentCount: -1 } });

    return res.status(200).json({ message: 'Comment deleted successfully.' });
  } catch (error) {
    if (error.name === 'CastError') return res.status(400).json({ message: 'Invalid ID.' });
    return res.status(500).json({ message: error.message });
  }
};

module.exports = { addComment, getComments, deleteComment };
