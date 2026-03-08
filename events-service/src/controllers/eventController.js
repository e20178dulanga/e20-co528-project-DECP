const Event = require('../models/Event');
const Notification = require('../models/Notification');
const RSVP = require('../models/RSVP');

// ── POST /api/events  (admin or alumni) ────────────────────────
const createEvent = async (req, res) => {
  try {
    const { title, type, description, location, startDate, endDate, capacity } = req.body;

    if (!title || !type || !description || !startDate) {
      return res.status(400).json({ message: 'title, type, description, and startDate are required.' });
    }
    if (!['event', 'workshop', 'announcement'].includes(type)) {
      return res.status(400).json({ message: 'type must be event, workshop, or announcement.' });
    }

    const event = await Event.create({
      organizer: req.user.id,
      organizerName: req.user.name,
      title, type, description,
      location: location || 'Online',
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : undefined,
      capacity: capacity || 0,
    });

    // Notify previous RSVPers of this organizer about the new event
    // (find all users who have RSVPed to past events by the same organizer)
    const pastEvents = await Event.find({ organizer: req.user.id, _id: { $ne: event._id } }).select('_id');
    if (pastEvents.length > 0) {
      const pastEventIds = pastEvents.map((e) => e._id);
      const pastRsvps = await RSVP.find({ event: { $in: pastEventIds } }).distinct('user');

      if (pastRsvps.length > 0) {
        const notifications = pastRsvps.map((userId) => ({
          recipient: userId,
          type: 'new_event',
          message: `${req.user.name} posted a new ${type}: "${title}"`,
          refId: event._id,
        }));
        await Notification.insertMany(notifications);
      }
    }

    return res.status(201).json({ event });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// ── GET /api/events  (paginated, filterable) ───────────────────
const getEvents = async (req, res) => {
  try {
    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.min(50, parseInt(req.query.limit) || 20);
    const skip  = (page - 1) * limit;

    const filter = { isCancelled: false };
    if (req.query.type && ['event', 'workshop', 'announcement'].includes(req.query.type)) {
      filter.type = req.query.type;
    }
    if (req.query.upcoming === 'true') {
      filter.startDate = { $gte: new Date() };
    }

    const [events, total] = await Promise.all([
      Event.find(filter).sort({ startDate: 1 }).skip(skip).limit(limit),
      Event.countDocuments(filter),
    ]);

    return res.status(200).json({ total, page, pages: Math.ceil(total / limit), events });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// ── GET /api/events/:id ────────────────────────────────────────
const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found.' });
    return res.status(200).json({ event });
  } catch (error) {
    if (error.name === 'CastError') return res.status(400).json({ message: 'Invalid event ID.' });
    return res.status(500).json({ message: error.message });
  }
};

// ── PUT /api/events/:id  (organizer only) ─────────────────────
const updateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found.' });

    if (event.organizer.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only the organizer can edit this event.' });
    }
    if (event.isCancelled) {
      return res.status(400).json({ message: 'Cannot edit a cancelled event.' });
    }

    const allowed = ['title', 'description', 'location', 'startDate', 'endDate', 'capacity', 'type'];
    allowed.forEach((f) => { if (req.body[f] !== undefined) event[f] = req.body[f]; });

    await event.save();
    return res.status(200).json({ event });
  } catch (error) {
    if (error.name === 'CastError') return res.status(400).json({ message: 'Invalid event ID.' });
    return res.status(500).json({ message: error.message });
  }
};

// ── DELETE /api/events/:id  (organizer or admin) ──────────────
const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found.' });

    const isOwner = event.organizer.toString() === req.user.id;
    const isAdmin  = req.user.role === 'admin';
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized to delete this event.' });
    }

    await event.deleteOne();
    return res.status(200).json({ message: 'Event deleted.' });
  } catch (error) {
    if (error.name === 'CastError') return res.status(400).json({ message: 'Invalid event ID.' });
    return res.status(500).json({ message: error.message });
  }
};

// ── PATCH /api/events/:id/cancel  (organizer only) ────────────
const cancelEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found.' });

    if (event.organizer.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only the organizer can cancel this event.' });
    }
    if (event.isCancelled) {
      return res.status(400).json({ message: 'Event is already cancelled.' });
    }

    event.isCancelled = true;
    await event.save();

    // Notify all RSVPed users about the cancellation
    const rsvps = await RSVP.find({ event: event._id });
    if (rsvps.length > 0) {
      const notifications = rsvps.map((r) => ({
        recipient: r.user,
        type: 'event_cancelled',
        message: `The event "${event.title}" on ${event.startDate.toDateString()} has been cancelled.`,
        refId: event._id,
      }));
      await Notification.insertMany(notifications);
    }

    return res.status(200).json({ message: 'Event cancelled. All attendees notified.', event });
  } catch (error) {
    if (error.name === 'CastError') return res.status(400).json({ message: 'Invalid event ID.' });
    return res.status(500).json({ message: error.message });
  }
};

module.exports = { createEvent, getEvents, getEventById, updateEvent, deleteEvent, cancelEvent };
