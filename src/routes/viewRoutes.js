const express = require('express');
const router = express.Router();
const { showMessage } = require('../controllers/messageController');

router.get('/', (req, res) => {
    if (req.session.user) {
        res.redirect('/user/home');
    } else {
        res.redirect('/user/auth/login');
    }
});

router.get('/message', showMessage);

module.exports = router;
