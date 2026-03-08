const mongoose = require('mongoose');

const mediaFileSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },   // e.g. /uploads/1709803200000-photo.jpg
    type: { type: String, enum: ['image', 'video'], required: true },
    filename: { type: String },
  },
  { _id: false }
);

const postSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      // References User._id from the auth service (same MongoDB instance)
    },
    authorName: {
      type: String,
      required: true,
      // Denormalized to avoid cross-service DB joins
    },
    content: {
      type: String,
      required: [true, 'Post content is required'],
      trim: true,
      maxlength: [2000, 'Post cannot exceed 2000 characters'],
    },
    mediaFiles: [mediaFileSchema],
    likes: {
      // Each entry is the ObjectId of the user who liked
      type: [mongoose.Schema.Types.ObjectId],
      default: [],
    },
    shares: {
      type: Number,
      default: 0,
    },
    commentCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// ── Virtual: like count ───────────────────────────────────────
postSchema.virtual('likeCount').get(function () {
  return this.likes.length;
});

postSchema.set('toJSON', { virtuals: true });
postSchema.set('toObject', { virtuals: true });

const Post = mongoose.model('Post', postSchema);
module.exports = Post;
