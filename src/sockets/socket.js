const Room = require('../models/room');

module.exports = (io) => {
    io.on('connection', (socket) => {
        console.log('Player connected:', socket.id);

        socket.on('joinRoom', async (roomId) => {
            socket.join(roomId);
            console.log(`Player ${socket.id} joined room ${roomId}`);

            const room = await Room.findById(roomId);
            if (room.isFull()) {
                io.to(roomId).emit('gameStarted');
            }
        });

        socket.on('playCard', (data) => {
            console.log('Card played:', data);
            io.to(data.roomId).emit('updateGameState', { /* обновлённые данные игры */ });
        });

        socket.on('disconnect', () => {
            console.log('Player disconnected:', socket.id);
        });
    });
};