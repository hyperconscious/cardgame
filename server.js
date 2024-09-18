const http = require('http');
const socketIo = require('socket.io');
const app = require('./app');
const socketHandler = require('./config/socket');

const server = http.createServer(app);
const io = socketIo(server);

socketHandler(io);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});