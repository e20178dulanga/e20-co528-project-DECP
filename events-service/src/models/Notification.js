const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,    // queried heavily by user ID
    },
    type: {
      type: String,
      enum: ['new_event', 'rsvp_received', 'event_cancelled'],
      required: true,
    },
    message: { type: String, required: true },
    refId: { type: mongoose.Schema.Types.ObjectId },    // Event or RSVP _id
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Notification = mongoose.model('Notification', notificationSchema);
module.exports = Notification;
