const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema(
  {
    poster: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    posterName: { type: String, required: true },  // denormalized from JWT
    posterRole: { type: String, enum: ['alumni', 'admin'], required: true },

    title: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true,
    },
    company: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
    },
    type: {
      type: String,
      enum: ['job', 'internship'],
      required: [true, 'Type must be "job" or "internship"'],
    },
    location: {
      type: String,
      default: 'Remote',
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Job description is required'],
      trim: true,
    },
    requirements: [{ type: String }],
    deadline: { type: Date },
    isOpen: { type: Boolean, default: true },
    applicationCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const Job = mongoose.model('Job', jobSchema);
module.exports = Job;
