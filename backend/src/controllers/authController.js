const jwt = require('jsonwebtoken');
const User = require('../models/User');

// ── Helper: sign JWT ──────────────────────────────────────────
// Encode id, name, and role so all services can read them without a DB lookup
const signToken = (id, name, role) =>
  jwt.sign({ id, name, role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });

// ── Helper: format user response (no password) ────────────────
const userResponse = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  bio: user.bio,
  graduationYear: user.graduationYear,
  skills: user.skills,
  linkedinUrl: user.linkedinUrl,
  profilePicture: user.profilePicture,
  createdAt: user.createdAt,
});

// ── POST /api/auth/register ───────────────────────────────────
const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Basic validation
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required.' });
    }

    // Prevent clients from self-assigning admin role
    const assignedRole = role === 'admin' ? 'student' : role || 'student';

    // Check duplicate email
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ message: 'An account with this email already exists.' });
    }

    const user = await User.create({ name, email, password, role: assignedRole });

    const token = signToken(user._id, user.name, user.role);
    return res.status(201).json({ token, user: userResponse(user) });
  } catch (error) {
    console.error('register error:', error);
    return res.status(500).json({ message: error.message });
  }
};

// ── POST /api/auth/login ──────────────────────────────────────
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    // `.select('+password')` re-includes the hidden field
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const token = signToken(user._id, user.name, user.role);
    return res.status(200).json({ token, user: userResponse(user) });
  } catch (error) {
    console.error('login error:', error);
    return res.status(500).json({ message: error.message });
  }
};

module.exports = { register, login };
