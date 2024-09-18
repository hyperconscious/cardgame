const express = require('express');
const path = require('path');
const router = express.Router();

const gameController = require('../controllers/gameController');

router.use((req, res, next) => {
    if (req.session.user) {
      next();
    } else {
      res.redirect('/');
    }
  });

router.get('/', (req, res) => res.sendFile(path.join(__dirname, '../views/mainGame.html')));
router.get('/wait-for-opponent', (req, res) => res.sendFile(path.join(__dirname, '../views/lobby.html')));
router.get('/play', gameController.playGame);
router.post('/find-game', gameController.findGame);

module.exports = router;