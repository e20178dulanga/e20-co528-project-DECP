const User = require('../models/User');

// Allowed fields a user can update on their own profile
const UPDATABLE_FIELDS = ['name', 'bio', 'graduationYear', 'skills', 'linkedinUrl', 'profilePicture'];

// ── GET /api/users/me ─────────────────────────────────────────
const getMe = async (req, res) => {
  try {
    // req.user is already attached by authMiddleware
    return res.status(200).json({ user: req.user });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// ── PUT /api/users/me ─────────────────────────────────────────
const updateMe = async (req, res) => {
  try {
    // Only pick allowed fields to prevent mass-assignment (e.g. changing role/email)
    const updates = {};
    UPDATABLE_FIELDS.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: 'No valid fields to update.' });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    return res.status(200).json({ user: updatedUser });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// ── GET /api/users/:id  (admin only) ─────────────────────────
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    return res.status(200).json({ user });
  } catch (error) {
    // CastError means invalid ObjectId format
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid user ID format.' });
    }
    return res.status(500).json({ message: error.message });
  }
};

// ── GET /api/users/stats (admin only) ─────────────────────────
const getUserStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const students = await User.countDocuments({ role: 'student' });
    const alumni = await User.countDocuments({ role: 'alumni' });
    return res.status(200).json({ totalUsers, students, alumni });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// ── GET /api/users/search ──────────────────────────────────────
const searchUsers = async (req, res) => {
  try {
    const q = req.query.q || '';
    if (!q.trim()) return res.status(200).json({ users: [] });
    
    // Explicitly select only public-safe fields
    const users = await User.find({ name: { $regex: q, $options: 'i' } })
      .select('name profilePicture role')
      .limit(15);
    return res.status(200).json({ users });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// ── GET /api/users  (admin only) ──────────────────────────────
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    return res.status(200).json({ count: users.length, users });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = { getMe, updateMe, getUserById, getAllUsers, getUserStats, searchUsers };
