const User = require('../models/User');

// GET /api/admin/pending — list users awaiting approval
const getPendingUsers = async (req, res) => {
  try {
    const users = await User.find({ status: 'pending' })
      .select('name email role status createdAt')
      .sort({ createdAt: -1 });
    res.status(200).json({ users });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/admin/approve/:id — approve a user
const approveUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found.' });

    user.status = 'approved';
    await user.save();

    res.status(200).json({ message: `${user.name} has been approved.`, user: { _id: user._id, name: user.name, email: user.email, role: user.role, status: user.status } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/admin/reject/:id — reject a user
const rejectUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found.' });

    user.status = 'rejected';
    await user.save();

    res.status(200).json({ message: `${user.name} has been rejected.`, user: { _id: user._id, name: user.name, email: user.email, role: user.role, status: user.status } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/admin/users — list all users with their statuses
const getAllUsersAdmin = async (req, res) => {
  try {
    const users = await User.find()
      .select('name email role status createdAt')
      .sort({ createdAt: -1 });
    res.status(200).json({ users });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getPendingUsers, approveUser, rejectUser, getAllUsersAdmin };
