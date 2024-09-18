const Room = require('../models/room');
const User = require('../models/user');

exports.findGame = async (req, res) => {
    try {
        const userId = req.session.user.id;
        console.log('finding free room...');
        let room = await Room.findWaitingRoom();

        if (!room) {
            console.log('room isn\'t find creating new...');
            room = await Room.create(userId);
            res.redirect(`/wait-for-opponent?roomId=${room.id}`);
        } else {
            console.log('room was found joining...');
            await room.join(userId);
            res.redirect(`/play?roomId=${room.id}`);
        }
    } catch (error) {
        console.error(error);
        res.redirect('/message?type=error&message=Error%20finding%20a%20game');
    }
};