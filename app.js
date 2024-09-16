const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const app = express();

const authRouter = require('./src/routes/authRoutes');
const userRouter = require('./src/routes/userRoutes');
const viewRouter = require('./src/routes/viewRoutes');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'views')));

app.use(session({
    secret: 'secured',
    resave: false,
    saveUninitialized: true
}));

app.use('/', viewRouter);
app.use('/user/auth', authRouter);
app.use('/user', userRouter);

app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, './src/views/404NotFound.html'));
});

app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});