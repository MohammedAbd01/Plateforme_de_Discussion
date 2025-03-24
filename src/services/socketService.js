const socketIO = require('socket.io');

let io;

const initSocket = (server) => {
    io = socketIO(server);

    io.on('connection', (socket) => {
        console.log('New client connected');

        socket.on('joinRoom', (room) => {
            socket.join(room);
            console.log(`Client joined room: ${room}`);
        });

        socket.on('sendMessage', (message) => {
            const { room, content, sender } = message;
            io.to(room).emit('receiveMessage', { content, sender });
        });

        socket.on('disconnect', () => {
            console.log('Client disconnected');
        });
    });
};

const getIO = () => {
    if (!io) {
        throw new Error('Socket.io not initialized!');
    }
    return io;
};

module.exports = {
    initSocket,
    getIO,
};