const express = require('express');
const path = require('path');
const fs = require('fs');
const router = express.Router();
const userController = require('../controllers/userController');

router.post('/login', userController.login);
router.post('/register', userController.register);
router.post('/password-reminder', userController.passwordReminder);
router.get('/logout', userController.logout);

router.use((req, res, next) => {
  if (req.session.user) {
    next();
  } else {
    res.redirect('/login');
  }
});

router.get('/home', (req, res) => {
    fs.readFile(path.join(__dirname, '../views/home.html'), 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading the file:', err);
            return res.status(500).send('Server error');
        }

        let html = data.replace('%LOGIN%', req.session.user.login)
                       .replace('%ROLE%', req.session.user.role);

        res.send(html);
    });
});

module.exports = router;
