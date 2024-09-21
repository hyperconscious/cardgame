const Room = require('../models/room');

module.exports = (io) => {
    io.on('connection', (socket) => {
        console.log('Player connected:', socket.id);

        socket.on('joinRoom', async (roomId) => {
            socket.join(roomId);
            console.log(`Player ${socket.id} joined room ${roomId}`);

            const room = await Room.findById(roomId);
            socket.userId = room.player1_id; 
            if (room.isFull()) {
                socket.userId = room.player2_id; 
                io.to(roomId).emit('gameStarted');
            }
        });

        socket.on('playCard', (data) => {
            console.log('Card played:', data);
            io.to(data.roomId).emit('updateGameState', { /* обновлённые данные игры */ });
        });

        socket.on('disconnecting', async () => {
            const rooms = Array.from(socket.rooms).filter(roomId => roomId !== socket.id);
            for (const roomId of rooms) {
                console.log(`Leaving room ${roomId}, player: ${socket.userId}`);
                socket.leave(roomId);
            
                const room = await Room.findById(roomId);
                if(!room) return;
                
                if (socket.userId === room.player1_id) {
                    await Room.deleteOne(roomId);
                    console.log(`Deleting room...`);
                } else if (socket.userId === room.player2_id)  {
                    room.removePlayer(socket.id);
                    console.log(`Removing player ${socket.id}`);
                }
            }
        });

        socket.on('disconnect', async () => {
            console.log('Player disconnected:', socket.id);
        });
    });
};