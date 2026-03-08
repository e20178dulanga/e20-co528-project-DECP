const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const { createRSVP, cancelRSVP, getAttendees, getMyRSVPs } = require('../controllers/rsvpController');

const router = express.Router();

router.use(authMiddleware);

// View own RSVPs
router.get('/rsvps/mine', getMyRSVPs);

// RSVP to an event
router.post('/events/:eventId/rsvp', createRSVP);

// Cancel own RSVP
router.delete('/events/:eventId/rsvp', cancelRSVP);

// View attendees for an event (organizer or admin access enforced in controller)
router.get('/events/:eventId/attendees', getAttendees);

module.exports = router;
