module.exports = (io) => {
    io.on('connection', (socket) => {
        console.log('Player connected:', socket.id);

        socket.on('joinRoom', (roomId) => {
            socket.join(roomId);
            console.log(`Player ${socket.id} joined room ${roomId}`);
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