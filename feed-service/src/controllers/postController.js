const path = require('path');
const multer = require('multer');
const Post = require('../models/Post');

// ── Multer config: memory storage (for MongoDB Base64 conversion) ──
const storage = multer.memoryStorage();

const fileFilter = (_req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/quicktime'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Unsupported file type. Allowed: JPEG, PNG, GIF, WEBP, MP4, MOV'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: Number(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024 }, // 10MB
});

// Export the multer instance so routes can use upload.array('media', 5)
const uploadMedia = upload.array('media', 5);

// ── Helper: map mimetype to media type ───────────────────────
const getMediaType = (mimetype) => (mimetype.startsWith('video') ? 'video' : 'image');

// ── POST /api/posts  (text post) ─────────────────────────────
const createPost = async (req, res) => {
  try {
    const { content } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'Post content is required.' });
    }

    const post = await Post.create({
      author: req.user.id,
      authorName: req.user.name,
      content: content.trim(),
    });

    return res.status(201).json({ post });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// ── POST /api/posts/media  (media upload) ────────────────────
const createMediaPost = [
  uploadMedia,
  async (req, res) => {
    try {
      const { content } = req.body;
      if (!content && (!req.files || req.files.length === 0)) {
        return res.status(400).json({ message: 'Post must have content or at least one media file.' });
      }

      const mediaFiles = (req.files || []).map((file) => {
        const base64Data = file.buffer.toString('base64');
        return {
          url: `data:${file.mimetype};base64,${base64Data}`,
          type: getMediaType(file.mimetype),
          filename: file.originalname,
        };
      });

      const post = await Post.create({
        author: req.user.id,
        authorName: req.user.name,
        content: (content || '').trim(),
        mediaFiles,
      });

      return res.status(201).json({ post });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  },
];

// ── GET /api/posts  (paginated feed) ─────────────────────────
const getPosts = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, parseInt(req.query.limit) || 20);
    const skip = (page - 1) * limit;

    const [posts, total] = await Promise.all([
      Post.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
      Post.countDocuments(),
    ]);

    return res.status(200).json({
      total,
      page,
      pages: Math.ceil(total / limit),
      posts,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// ── GET /api/posts/:id ────────────────────────────────────────
const getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found.' });
    return res.status(200).json({ post });
  } catch (error) {
    if (error.name === 'CastError') return res.status(400).json({ message: 'Invalid post ID.' });
    return res.status(500).json({ message: error.message });
  }
};

// ── PUT /api/posts/:id  (text update, own post only) ─────────
const updatePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found.' });

    // Ownership check
    if (post.author.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You can only edit your own posts.' });
    }

    const { content } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'Content is required.' });
    }

    post.content = content.trim();
    await post.save();
    return res.status(200).json({ post });
  } catch (error) {
    if (error.name === 'CastError') return res.status(400).json({ message: 'Invalid post ID.' });
    return res.status(500).json({ message: error.message });
  }
};

// ── DELETE /api/posts/:id  (own post only) ───────────────────
const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found.' });

    if (post.author.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You can only delete your own posts.' });
    }

    await post.deleteOne();
    return res.status(200).json({ message: 'Post deleted successfully.' });
  } catch (error) {
    if (error.name === 'CastError') return res.status(400).json({ message: 'Invalid post ID.' });
    return res.status(500).json({ message: error.message });
  }
};

// ── POST /api/posts/:id/like  (toggle like) ──────────────────
const toggleLike = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found.' });

    const userId = req.user.id;
    const alreadyLiked = post.likes.some((id) => id.toString() === userId);

    if (alreadyLiked) {
      // Unlike
      post.likes = post.likes.filter((id) => id.toString() !== userId);
    } else {
      // Like
      post.likes.push(userId);
    }

    await post.save();
    return res.status(200).json({
      liked: !alreadyLiked,
      likeCount: post.likes.length,
      post,
    });
  } catch (error) {
    if (error.name === 'CastError') return res.status(400).json({ message: 'Invalid post ID.' });
    return res.status(500).json({ message: error.message });
  }
};

// ── POST /api/posts/:id/share ─────────────────────────────────
const sharePost = async (req, res) => {
  try {
    const post = await Post.findByIdAndUpdate(
      req.params.id,
      { $inc: { shares: 1 } },
      { new: true }
    );
    if (!post) return res.status(404).json({ message: 'Post not found.' });
    return res.status(200).json({ shares: post.shares, post });
  } catch (error) {
    if (error.name === 'CastError') return res.status(400).json({ message: 'Invalid post ID.' });
    return res.status(500).json({ message: error.message });
  }
};

// ── GET /api/posts/stats ─────────────────────────────────
const getPostStats = async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'alumni') {
      return res.status(403).json({ message: 'Forbidden' });
    }
    const totalPosts = await Post.countDocuments();
    const topPosts = await Post.aggregate([
      { $addFields: { likeCount: { $size: { $ifNull: ["$likes", []] } } } },
      { $sort: { likeCount: -1 } },
      { $limit: 5 }
    ]);
    return res.status(200).json({ totalPosts, topPosts });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = { createPost, createMediaPost, getPosts, getPostById, updatePost, deletePost, toggleLike, sharePost, getPostStats };
