const express = require('express');
const router = express.Router();
const avatarController = require('../controllers/avatarController');

router.post('/upload-avatar', avatarController.uploadAvatar);

router.get('/user-avatar/:userId?', avatarController.getUserAvatar);

module.exports = router;