const socketIO = require('socket.io');

const initSocket = (io) => {
    io.on('connection', (socket) => {
        console.log('A user connected:', socket.id);

        socket.on('joinRoom', (room) => {
            socket.join(room);
            console.log(`User ${socket.id} joined room: ${room}`);
        });

        socket.on('sendMessage', (data) => {
            const { room, message } = data;
            io.to(room).emit('receiveMessage', message);
            console.log(`Message sent to room ${room}: ${message}`);
        });

        socket.on('disconnect', () => {
            console.log('User disconnected:', socket.id);
        });
    });
};

module.exports = { initSocket };