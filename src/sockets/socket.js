const Room = require('../models/room');
const Card = require('../models/card');
const User = require('../models/user');
const e = require('express');

module.exports = (io) => {
    let roomsData = {};
    let players = {};
    io.on('connection', (socket) => {

        console.log('Player connected:', socket.id);

        socket.on('joinRoom', async (roomId) => {
            socket.join(roomId);
            console.log(`Player ${socket.id} joined room ${roomId}`);
            const room = await Room.findById(roomId);
            if(!room) return;
            
            if (room.isFull()) {
                console.log('full');
                const user = await User.findById(room.player2_id);
                const enemy = await User.findById(room.player1_id);

                const players = {
                    user: {
                        id: user.id,
                        name: user.login
                    },
                    enemy: {
                        id: enemy.id,
                        name: enemy.login
                    }
                };
                const isFirstPlayer = socket.userId === room.player1_id;

                roomsData[parseInt(roomId)].firstPlayerCards = new Array(5);
                roomsData[parseInt(roomId)].secondPlayerCards = new Array(5);
                roomsData[parseInt(roomId)].firstPlayerDeployed = new Array(5);
                roomsData[parseInt(roomId)].secondPlayerDeployed = new Array(5);
                roomsData[parseInt(roomId)].secondPlayer = socket.id;
                
                
                io.to(roomsData[parseInt(roomId)].secondPlayer).emit('gameStarted', false, players, !isFirstPlayer);
                io.to(roomsData[parseInt(roomId)].firstPlayer).emit('gameStarted', true, players, isFirstPlayer);
                
            }else{
                roomsData[parseInt(roomId)] = {};
                roomsData[parseInt(roomId)].firstPlayer = socket.id;
                roomsData[parseInt(roomId)].playerTurn = socket.id;
            }
        });

        socket.on('playCard', (card, field) => {
            
            let room = roomsData[Array.from(socket.rooms)[1]];
            if(room.firstPlayer == socket.id)
            {
                io.to(room.secondPlayer).emit('enemyCardPlayed', card, field);
                room.firstPlayerDeployed[field] = card;
            }
            if(room.secondPlayer == socket.id)
            {
                io.to(room.firstPlayer).emit('enemyCardPlayed', card, field);
                room.secondPlayerDeployed[field] = card;
            }
        });

        socket.on('getRandCard', async () => {
            socket.emit('receiveCard', await Card.getRandCard());
        });

        socket.on('nextTurn', () => {
            let room = roomsData[Array.from(socket.rooms)[1]];
            if(room.firstPlayer == room.playerTurn) {
                socket.points+=2;
                io.to(room.firstPlayer).emit('changeTurn', false);
                io.to(room.secondPlayer).emit('changeTurn', true);
                room.playerTurn = room.secondPlayer;
            } else if(room.secondPlayer == room.playerTurn) {
                socket.points+=2;
                io.to(room.firstPlayer).emit('changeTurn', true);
                io.to(room.secondPlayer).emit('changeTurn', false);
                room.playerTurn = room.firstPlayer;
            }
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
                    delete roomsData[roomId];
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