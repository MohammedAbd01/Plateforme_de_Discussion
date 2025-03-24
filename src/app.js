const express = require('express');
const mongoose = require('mongoose');
const http = require('http');
const socketIo = require('socket.io');
const authRoutes = require('./routes/auth');
const messageRoutes = require('./routes/messages');
const roomRoutes = require('./routes/rooms');
const { initSocket } = require('./config/socket');
const { connectDB } = require('./config/database');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/rooms', roomRoutes);

// Database connection
connectDB();

// Initialize Socket.io
initSocket(io);

// Start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});