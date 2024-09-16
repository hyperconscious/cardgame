const express = require('express');
const path = require('path');
const router = express.Router();

router.get('/login', (req, res) => res.sendFile(path.join(__dirname, '../views/login.html')));
router.get('/registration', (req, res) => res.sendFile(path.join(__dirname, '../views/registration.html')));
router.get('/password-reminder', (req, res) => res.sendFile(path.join(__dirname, '../views/reminder.html')));

module.exports = router;
