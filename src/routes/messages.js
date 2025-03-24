const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const authMiddleware = require('../middlewares/auth');

// Route to send a message
router.post('/', authMiddleware, messageController.sendMessage);

// Route to retrieve messages for a specific room
router.get('/:roomId', authMiddleware, messageController.getMessages);

module.exports = router;