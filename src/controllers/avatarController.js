const Busboy = require('busboy');
const fs = require('fs');
const path = require('path');
const db = require('../../config/db');

const getFileExtension = (filename) => {
    const parts = filename.split('.');
    return parts.length > 1 ? parts.pop() : '';
};

const uploadAvatar = (req, res) => {
    const userId = req.session.user.id;
    const busboy = Busboy({ headers: req.headers });
    let avatarPath;

    busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
        if (!filename) {
            return res.status(400).json({ message: 'No file uploaded' });
        }
        const newfilename = `${Date.now()}.${getFileExtension(filename.filename)}`;
        const relativePath = `/images/${newfilename}`;
        avatarPath = relativePath;
        fullpath = path.join(__dirname, '../../public/images' , newfilename);

        const writeStream = fs.createWriteStream(fullpath);
        file.pipe(writeStream);

        writeStream.on('finish', () => {
            console.log('File uploaded successfully:', fullpath);
        });
    });

    busboy.on('finish', async () => {
        try {
            await db.query('UPDATE users SET avatar = ? WHERE id = ?', [avatarPath, userId]);
            res.status(200).json({ message: 'Avatar uploaded successfully!', avatarPath });
        } catch (error) {
            res.status(500).json({ message: 'Error uploading avatar', error });
        }
    });

    busboy.on('error', (error) => {
        res.status(500).json({ message: 'Error during file upload', error });
    });

    req.pipe(busboy);
};

const getUserAvatar = async (req, res) => {

    const userId = req.session.user.id;

    try {
        const [user] = await db.query('SELECT avatar FROM users WHERE id = ?', [userId]);
        const avatarPath = user[0] || '/images/default-avatar.png';
        res.json(avatarPath);
    } catch (error) {
        console.error('Error fetching user avatar:', error);
        res.status(500).json({ message: 'Error fetching user avatar', error });
    }
};

module.exports = {
    uploadAvatar,
    getUserAvatar,
};