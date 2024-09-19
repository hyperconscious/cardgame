const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const http = require('http');
const { Server } = require('socket.io');
const socketHandler = require('./src/sockets/socket');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});
//test

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'views')));

app.use(session({
    secret: 'secured',
    resave: false,
    saveUninitialized: true,
    cookie: {
        sameSite: 'lax'
    }
}));

const authRouter = require('./src/routes/authRoutes');
const userRouter = require('./src/routes/userRoutes');
const viewRouter = require('./src/routes/viewRoutes');
const gameRouter = require('./src/routes/gameRoutes');

app.use('/', viewRouter);
app.use('/user/auth', authRouter);
app.use('/user', userRouter);
app.use('/game', gameRouter);

app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, './src/views/404NotFound.html'));
});

socketHandler(io);


const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
