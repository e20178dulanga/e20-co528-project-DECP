const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const { getMessages, sendMessage, getRecentConversations } = require('../controllers/messageController');

const router = express.Router();

router.use(authMiddleware);

router.get('/conversations', getRecentConversations);
router.get('/:userId', getMessages);
router.post('/', sendMessage);

module.exports = router;
