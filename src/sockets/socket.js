const Room = require('../models/room');
const Card = require('../models/card');
const User = require('../models/user');
const e = require('express');
const { resume } = require('../../config/db');

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
                roomsData[parseInt(roomId)].secondPlayerHp = 40;
                
                io.to(roomsData[parseInt(roomId)].secondPlayer).emit('gameStarted', false, players, !isFirstPlayer);
                io.to(roomsData[parseInt(roomId)].firstPlayer).emit('gameStarted', true, players, isFirstPlayer);
                
            }else{
                roomsData[parseInt(roomId)] = {};
                roomsData[parseInt(roomId)].firstPlayer = socket.id;
                roomsData[parseInt(roomId)].firstPlayerHp = 40;
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

        socket.on('getRandCards', async (count) => {
            result = new Array(count);
            for(let i = 0; i < count; i++)
            {
                result[i] = await Card.getRandCard();
                if(!result[i]) i--; 
                else console.log(result[i].avatar, result[i].character_name);
            }
            socket.emit('receiveCards', result);
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
                battleAction(room);
            }
        });

        socket.on('getTurn', () => {
            io.to(socket.id).emit('changeTurn', roomsData[Array.from(socket.rooms)[1]].playerTurn == socket.id);
        });
        function battleAction(room) {
            for(let i = 0; i < 5; i++)
            {
                if(room.firstPlayerDeployed[i] && !room.secondPlayerDeployed[i])
                    room.secondPlayerHp -= room.firstPlayerDeployed[i].attack;
                if(!room.firstPlayerDeployed[i] && room.secondPlayerDeployed[i])
                    room.firstPlayerHp -= room.secondPlayerDeployed[i].attack;
                if(room.firstPlayerDeployed[i] && room.secondPlayerDeployed[i]) {
                    room.firstPlayerDeployed[i].defense -= room.secondPlayerDeployed[i].attack;
                    room.secondPlayerDeployed[i].defense -= room.firstPlayerDeployed[i].attack;
                    if(room.firstPlayerDeployed[i].defense <= 0) room.firstPlayerDeployed[i] = null;
                    if(room.secondPlayerDeployed[i].defense <= 0) room.secondPlayerDeployed[i] = null;
                }
            }
            io.to(room.firstPlayer).emit('updateBattleField', 
                room.firstPlayerHp, 
                room.secondPlayerHp, 
                room.firstPlayerDeployed,
                room.secondPlayerDeployed);

            io.to(room.secondPlayer).emit('updateBattleField',  
                room.secondPlayerHp, 
                room.firstPlayerHp,
                room.secondPlayerDeployed, 
                room.firstPlayerDeployed);

            if(room.firstPlayerHp <= 0 && room.secondPlayerHp > 0) {
                io.to(room.firstPlayer).emit('lose');
                io.to(room.secondPlayer).emit('win');
            }

            if(room.firstPlayerHp > 0 && room.secondPlayerHp <= 0) {
                io.to(room.firstPlayer).emit('win');
                io.to(room.secondPlayer).emit('lose');
            }

            if(room.firstPlayerHp <= 0 && room.secondPlayerHp <= 0) {
                io.to(room.firstPlayer).emit('draw');
                io.to(room.secondPlayer).emit('draw');
            }
        }

        socket.on('disconnecting', async () => {
            const rooms = Array.from(socket.rooms).filter(roomId => roomId !== socket.id);
            for (const roomId of rooms) {
                console.log(`Leaving room ${roomId}, player: ${socket.userId}`);
            
                const room = await Room.findById(roomId);
                if(!room) return;
                
                if (socket.userId === room.player1_id) {
                    await Room.deleteOne(roomId);
                    delete roomsData[roomId];
                    console.log(`Deleting room...`);
                } else if (socket.userId === room.player2_id) {
                    room.removePlayer(socket.id);
                    console.log(`Removing player ${socket.id}`);
                }
                socket.leave(roomId);
            }
        });

        

        socket.on('disconnect', async () => {
            console.log('Player disconnected:', socket.id);
        });


    });
};