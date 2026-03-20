const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
    },
    applicant: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    applicantName: { type: String, required: true },  // from JWT
    applicantRole: {
      type: String,
      enum: ['student', 'alumni'],
      required: true,
    },
    coverLetter: {
      type: String,
      default: '',
      trim: true,
      maxlength: [2000, 'Cover letter cannot exceed 2000 characters'],
    },
    cvFile: {
      url: String,
      filename: String,
    },
    status: {
      type: String,
      enum: ['pending', 'reviewed', 'accepted', 'rejected'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

// Prevent duplicate applications: one applicant per job
applicationSchema.index({ job: 1, applicant: 1 }, { unique: true });

const Application = mongoose.model('Application', applicationSchema);
module.exports = Application;
