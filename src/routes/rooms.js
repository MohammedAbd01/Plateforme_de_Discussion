const express = require('express');
const router = express.Router();
const roomController = require('../controllers/roomController');
const { authenticate } = require('../middlewares/auth');

// Create a new room
router.post('/', authenticate, roomController.createRoom);

// Join an existing room
router.post('/:roomId/join', authenticate, roomController.joinRoom);

// Get all rooms
router.get('/', roomController.getAllRooms);

// Get room details
router.get('/:roomId', roomController.getRoomDetails);

module.exports = router;