const mongoose = require('mongoose');

const rsvpSchema = new mongoose.Schema(
  {
    event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, required: true },
    userName: { type: String, required: true },    // from JWT
    userRole: { type: String, required: true },    // from JWT
  },
  { timestamps: true }
);

// One RSVP per user per event
rsvpSchema.index({ event: 1, user: 1 }, { unique: true });

const RSVP = mongoose.model('RSVP', rsvpSchema);
module.exports = RSVP;
