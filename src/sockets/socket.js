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

        socket.on('disconnect', async () => {
            console.log('Player disconnected:', socket.id);

            const rooms = Object.keys(socket.rooms);
            for (const roomId of rooms) {
                console.log(`Leaving room ${roomId}`)
                socket.leave(roomId);
            
                const room = await Room.findById(roomId);
                
                if (socket.id == room.player1_id) {
                    await Room.deleteOne(roomId);
                    console.log(`Deleting room...`)
                }
                else {
                    room.removePlayer(socket.id);
                    console.log(`Removing player ${socket.id}`)
                }
            }
        });
    });
};