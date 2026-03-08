const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');
const {
  createEvent, getEvents, getEventById, updateEvent, deleteEvent, cancelEvent,
} = require('../controllers/eventController');

const router = express.Router();

router.use(authMiddleware);

router.get('/', getEvents);
router.get('/:id', getEventById);

// Create — admin or alumni only
router.post('/', requireRole('admin', 'alumni'), createEvent);

// Edit — organizer only (ownership enforced in controller)
router.put('/:id', requireRole('admin', 'alumni'), updateEvent);

// Cancel — organizer only (enforced in controller)
router.patch('/:id/cancel', requireRole('admin', 'alumni'), cancelEvent);

// Delete — organizer or admin (enforced in controller)
router.delete('/:id', deleteEvent);

module.exports = router;
