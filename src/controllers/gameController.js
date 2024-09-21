const Room = require('../models/room');
const path = require('path');
const User = require('../models/user');

exports.findGame = async (req, res) => {
    try {
        const userId = req.session.user.id;
        let room = await Room.findWaitingRoom();
        if (!room) {
            room = await Room.create(userId);
            res.redirect(`wait-for-opponent?roomId=${room.id}`);
        } else {
            console.log('room was found joining...');
            await room.join(userId);
            console.log('room finded');
            res.redirect(`wait-for-opponent?roomId=${room.id}`);
        }
    } catch (error) {
        console.error(error);
        res.redirect('/message?type=error&message=Error%20finding%20a%20game');
    }
};

exports.playGame = (req, res) => {
    const roomId = req.query.roomId;
    if (!roomId) {
        return res.redirect('/message?type=error&message=Invalid%20room');
    }
    res.sendFile(path.join(__dirname, '../views/game.html'));
};