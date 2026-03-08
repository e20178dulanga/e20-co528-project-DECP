const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    organizer: { type: mongoose.Schema.Types.ObjectId, required: true },
    organizerName: { type: String, required: true },  // denormalized from JWT

    title: {
      type: String,
      required: [true, 'Event title is required'],
      trim: true,
    },
    type: {
      type: String,
      enum: ['event', 'workshop', 'announcement'],
      required: [true, 'Type must be event, workshop, or announcement'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    location: { type: String, default: 'Online', trim: true },
    startDate: { type: Date, required: [true, 'Start date is required'] },
    endDate: { type: Date },
    capacity: { type: Number, default: 0 },     // 0 = unlimited
    rsvpCount: { type: Number, default: 0 },    // cached count
    isCancelled: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Event = mongoose.model('Event', eventSchema);
module.exports = Event;
