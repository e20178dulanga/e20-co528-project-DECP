const RSVP = require('../models/RSVP');
const Event = require('../models/Event');
const Notification = require('../models/Notification');

// ── POST /api/events/:eventId/rsvp ────────────────────────────
const createRSVP = async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId);
    if (!event) return res.status(404).json({ message: 'Event not found.' });
    if (event.isCancelled) return res.status(400).json({ message: 'Cannot RSVP to a cancelled event.' });

    // Announcements don't support RSVPs
    if (event.type === 'announcement') {
      return res.status(400).json({ message: 'Announcements do not support RSVPs.' });
    }

    // Capacity check
    if (event.capacity > 0 && event.rsvpCount >= event.capacity) {
      return res.status(400).json({ message: 'Sorry, this event is fully booked.' });
    }

    const rsvp = await RSVP.create({
      event: event._id,
      user: req.user.id,
      userName: req.user.name,
      userRole: req.user.role,
    });

    // Increment cached RSVP count
    await Event.findByIdAndUpdate(event._id, { $inc: { rsvpCount: 1 } });

    // Notify the organizer about the new RSVP
    await Notification.create({
      recipient: event.organizer,
      type: 'rsvp_received',
      message: `${req.user.name} (${req.user.role}) just RSVPed to your event: "${event.title}"`,
      refId: rsvp._id,
    });

    return res.status(201).json({ message: 'RSVP confirmed!', rsvp });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: 'You have already RSVPed to this event.' });
    }
    if (error.name === 'CastError') return res.status(400).json({ message: 'Invalid event ID.' });
    return res.status(500).json({ message: error.message });
  }
};

// ── DELETE /api/events/:eventId/rsvp  (cancel own RSVP) ───────
const cancelRSVP = async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId);
    if (!event) return res.status(404).json({ message: 'Event not found.' });

    const rsvp = await RSVP.findOneAndDelete({ event: event._id, user: req.user.id });
    if (!rsvp) return res.status(404).json({ message: 'No RSVP found for this event.' });

    // Decrement cached count
    await Event.findByIdAndUpdate(event._id, { $inc: { rsvpCount: -1 } });

    return res.status(200).json({ message: 'RSVP cancelled.' });
  } catch (error) {
    if (error.name === 'CastError') return res.status(400).json({ message: 'Invalid event ID.' });
    return res.status(500).json({ message: error.message });
  }
};

// ── GET /api/events/:eventId/attendees  (organizer or admin) ──
const getAttendees = async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId);
    if (!event) return res.status(404).json({ message: 'Event not found.' });

    const isOwner = event.organizer.toString() === req.user.id;
    const isAdmin  = req.user.role === 'admin';
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Only the event organizer or an admin can view attendees.' });
    }

    const attendees = await RSVP.find({ event: event._id }).sort({ createdAt: 1 });
    return res.status(200).json({ count: attendees.length, attendees });
  } catch (error) {
    if (error.name === 'CastError') return res.status(400).json({ message: 'Invalid event ID.' });
    return res.status(500).json({ message: error.message });
  }
};

// ── GET /api/rsvps/mine ────────────────────────────────────────
const getMyRSVPs = async (req, res) => {
  try {
    const rsvps = await RSVP.find({ user: req.user.id })
      .populate('event', 'title type location startDate isCancelled rsvpCount')
      .sort({ createdAt: -1 });

    return res.status(200).json({ count: rsvps.length, rsvps });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = { createRSVP, cancelRSVP, getAttendees, getMyRSVPs };
