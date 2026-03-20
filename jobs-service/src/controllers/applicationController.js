const Application = require('../models/Application');
const Job = require('../models/Job');

// ── POST /api/jobs/:jobId/apply  (student or alumni) ──────────
const applyForJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId);
    if (!job) return res.status(404).json({ message: 'Job not found.' });

    if (!job.isOpen) {
      return res.status(400).json({ message: 'This job listing is closed and no longer accepting applications.' });
    }

    // Poster cannot apply to their own listing
    if (job.poster.toString() === req.user.id) {
      return res.status(400).json({ message: 'You cannot apply to your own job posting.' });
    }

    const application = await Application.create({
      job: job._id,
      applicant: req.user.id,
      applicantName: req.user.name,
      applicantRole: req.user.role,
      coverLetter: req.body.coverLetter || '',
      ...(req.file && {
        cvFile: {
          url: `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`,
          filename: req.file.originalname,
        }
      })
    });

    // Increment cached count on job
    await Job.findByIdAndUpdate(job._id, { $inc: { applicationCount: 1 } });

    return res.status(201).json({ message: 'Application submitted successfully.', application });
  } catch (error) {
    // Duplicate key = already applied
    if (error.code === 11000) {
      return res.status(409).json({ message: 'You have already applied for this job.' });
    }
    if (error.name === 'CastError') return res.status(400).json({ message: 'Invalid job ID.' });
    return res.status(500).json({ message: error.message });
  }
};

// ── GET /api/jobs/:jobId/applications  (poster or admin) ──────
const getApplicationsForJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId);
    if (!job) return res.status(404).json({ message: 'Job not found.' });

    const isOwner = job.poster.toString() === req.user.id;
    const isAdmin  = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Only the job poster or an admin can view applications.' });
    }

    const applications = await Application.find({ job: job._id }).sort({ createdAt: -1 });
    return res.status(200).json({ count: applications.length, applications });
  } catch (error) {
    if (error.name === 'CastError') return res.status(400).json({ message: 'Invalid job ID.' });
    return res.status(500).json({ message: error.message });
  }
};

// ── PATCH /api/jobs/:jobId/applications/:appId  (poster only) ─
const updateApplicationStatus = async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId);
    if (!job) return res.status(404).json({ message: 'Job not found.' });

    if (job.poster.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only the job poster can update application status.' });
    }

    const validStatuses = ['pending', 'reviewed', 'accepted', 'rejected'];
    const { status } = req.body;

    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ message: `Status must be one of: ${validStatuses.join(', ')}` });
    }

    const application = await Application.findByIdAndUpdate(
      req.params.appId,
      { status },
      { new: true, runValidators: true }
    );

    if (!application) return res.status(404).json({ message: 'Application not found.' });

    return res.status(200).json({ application });
  } catch (error) {
    if (error.name === 'CastError') return res.status(400).json({ message: 'Invalid ID.' });
    return res.status(500).json({ message: error.message });
  }
};

// ── GET /api/applications/mine  (any authenticated) ───────────
const getMyApplications = async (req, res) => {
  try {
    const applications = await Application.find({ applicant: req.user.id })
      .populate('job', 'title company type location isOpen deadline')
      .sort({ createdAt: -1 });

    return res.status(200).json({ count: applications.length, applications });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = { applyForJob, getApplicationsForJob, updateApplicationStatus, getMyApplications };
