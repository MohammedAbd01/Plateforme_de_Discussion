require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Create Express app
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.log('MongoDB connection error:', err));

// Add User schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  age: { type: Number, required: true },
  email: { type: String, required: true }
});

const User = mongoose.model('User', userSchema);

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Create predefined rooms
const ROOMS = ['MIP', 'BCG', 'GEGM'];
const roomData = {};

// Initialize empty message history for each room
ROOMS.forEach(room => {
  roomData[room] = {
    messages: [],
    users: []
  };
});

// Authentication routes
app.post('/api/register', async (req, res) => {
  try {
    const { username, password, firstName, lastName, age, email } = req.body;
    
    // Check if user exists
    const userExists = await User.findOne({ username });
    if (userExists) {
      return res.status(400).json({ message: 'Username already taken' });
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Create new user
    const user = new User({
      username,
      password: hashedPassword,
      firstName,
      lastName,
      age,
      email
    });
    
    await user.save();
    
    // Create token
    const token = jwt.sign(
      { id: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.status(201).json({ token, username });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Find user
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    // Create token
    const token = jwt.sign(
      { id: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.json({ token, username });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/profile', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.put('/api/profile', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Update fields
    const { firstName, lastName, age, email } = req.body;
    user.firstName = firstName || user.firstName;
    user.lastName = lastName || user.lastName;
    user.age = age || user.age;
    user.email = email || user.email;
    
    await user.save();
    
    res.json({ message: 'Profile updated', user: { ...user.toObject(), password: undefined } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Socket.io connection
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  let currentUser = null;
  let currentRoom = null;

  // Handle user login
  socket.on('login', async (userData) => {
    try {
      const { username, token } = userData;
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Verify username matches token
      if (decoded.username !== username) {
        socket.emit('error', { message: 'Invalid credentials' });
        return;
      }
      
      currentUser = {
        id: socket.id,
        username: username
      };
      
      io.emit('userList', { rooms: ROOMS });
      console.log(`${username} logged in`);
      
    } catch (error) {
      socket.emit('error', { message: 'Authentication failed' });
    }
  });

  // Handle joining a room
  socket.on('joinRoom', (room) => {
    // Leave previous room if any
    if (currentRoom) {
      socket.leave(currentRoom);
      roomData[currentRoom].users = roomData[currentRoom].users.filter(
        user => user.id !== socket.id
      );
      io.to(currentRoom).emit('userList', { users: roomData[currentRoom].users });
    }

    // Join new room
    socket.join(room);
    currentRoom = room;
    
    if (currentUser) {
      roomData[room].users.push(currentUser);
    }
    
    // Send room history to user
    socket.emit('roomHistory', { 
      messages: roomData[room].messages,
      room: room
    });
    
    // Update user list for the room
    io.to(room).emit('userList', { users: roomData[room].users });
    console.log(`User ${currentUser?.username} joined room: ${room}`);
  });

  // Handle chat messages
  socket.on('chatMessage', async (messageData) => {
    if (!currentUser || !currentRoom) return;
    
    // Extract mentions
    const mentionRegex = /@(\w+)/g;
    const mentions = [];
    let match;
    
    while ((match = mentionRegex.exec(messageData.text)) !== null) {
      mentions.push(match[1]); // Extract just the username without @
    }
    
    const message = {
      user: currentUser.username,
      text: messageData.text,
      timestamp: new Date().toISOString(),
      mentions: mentions
    };
    
    roomData[currentRoom].messages.push(message);
    io.to(currentRoom).emit('message', message);
    
    // Send notifications to mentioned users
    if (mentions.length > 0) {
      // Find all sockets of mentioned users
      Object.keys(io.sockets.sockets).forEach(socketId => {
        const socket = io.sockets.sockets[socketId];
        if (socket.username && mentions.includes(socket.username)) {
          socket.emit('mention', {
            from: currentUser.username,
            room: currentRoom,
            message: messageData.text
          });
        }
      });
    }
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    if (currentRoom && currentUser) {
      roomData[currentRoom].users = roomData[currentRoom].users.filter(
        user => user.id !== socket.id
      );
      io.to(currentRoom).emit('userList', { users: roomData[currentRoom].users });
    }
    console.log('User disconnected:', socket.id);
  });
});

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});