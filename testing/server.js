// server.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const db = require('./../config/db');
const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Указываем папку для статических файлов
app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

io.on('connection', (socket) => {
    console.log('New client connected');
    socket.on('hello', (msg) => {
        console.log(msg);
    });
});

// io.on('get_rand_card', (socket) => {
//     socket.emit('test', 'testing');
//     console.log('a');
// });

server.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});


