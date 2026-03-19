const Job = require('../models/Job');

// ── POST /api/jobs  (alumni or admin only) ─────────────────────
const createJob = async (req, res) => {
  try {
    const { title, company, type, location, description, requirements, deadline } = req.body;

    if (!title || !company || !type || !description) {
      return res.status(400).json({ message: 'title, company, type, and description are required.' });
    }

    if (!['job', 'internship'].includes(type)) {
      return res.status(400).json({ message: 'type must be "job" or "internship".' });
    }

    const job = await Job.create({
      poster: req.user.id,
      posterName: req.user.name,
      posterRole: req.user.role,
      title, company, type,
      location: location || 'Remote',
      description,
      requirements: requirements || [],
      deadline: deadline ? new Date(deadline) : undefined,
    });

    return res.status(201).json({ job });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// ── GET /api/jobs  (all authenticated) — paginated + filter ────
const getJobs = async (req, res) => {
  try {
    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.min(50, parseInt(req.query.limit) || 20);
    const skip  = (page - 1) * limit;

    // Optional filters
    const filter = {};
    if (req.query.type && ['job', 'internship'].includes(req.query.type)) {
      filter.type = req.query.type;
    }
    if (req.query.open !== 'false') filter.isOpen = true; // default: only open listings

    const [jobs, total] = await Promise.all([
      Job.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Job.countDocuments(filter),
    ]);

    return res.status(200).json({ total, page, pages: Math.ceil(total / limit), jobs });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// ── GET /api/jobs/:id ──────────────────────────────────────────
const getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found.' });
    return res.status(200).json({ job });
  } catch (error) {
    if (error.name === 'CastError') return res.status(400).json({ message: 'Invalid job ID.' });
    return res.status(500).json({ message: error.message });
  }
};

// ── PUT /api/jobs/:id  (poster only) ──────────────────────────
const updateJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found.' });

    if (job.poster.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You can only edit your own job postings.' });
    }

    const allowed = ['title', 'company', 'location', 'description', 'requirements', 'deadline', 'type'];
    allowed.forEach((field) => {
      if (req.body[field] !== undefined) job[field] = req.body[field];
    });

    await job.save();
    return res.status(200).json({ job });
  } catch (error) {
    if (error.name === 'CastError') return res.status(400).json({ message: 'Invalid job ID.' });
    return res.status(500).json({ message: error.message });
  }
};

// ── DELETE /api/jobs/:id  (poster or admin) ───────────────────
const deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found.' });

    const isOwner = job.poster.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized to delete this posting.' });
    }

    await job.deleteOne();
    return res.status(200).json({ message: 'Job posting deleted.' });
  } catch (error) {
    if (error.name === 'CastError') return res.status(400).json({ message: 'Invalid job ID.' });
    return res.status(500).json({ message: error.message });
  }
};

// ── PATCH /api/jobs/:id/close  (poster only) ─────────────────
const closeJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found.' });

    if (job.poster.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only the poster can close this listing.' });
    }

    job.isOpen = false;
    await job.save();
    return res.status(200).json({ message: 'Job listing closed.', job });
  } catch (error) {
    if (error.name === 'CastError') return res.status(400).json({ message: 'Invalid job ID.' });
    return res.status(500).json({ message: error.message });
  }
};

// ── GET /api/jobs/stats ──────────────────────────────────────
const getJobStats = async (req, res) => {
  try {
    const totalJobs = await Job.countDocuments();
    const openJobs = await Job.countDocuments({ isOpen: true });
    const popularJobs = await Job.find().sort({ applicationCount: -1 }).limit(5);
    return res.status(200).json({ totalJobs, openJobs, popularJobs });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = { createJob, getJobs, getJobById, updateJob, deleteJob, closeJob, getJobStats };
