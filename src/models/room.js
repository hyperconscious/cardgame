const db = require('../../config/db');

class Room {
    constructor({ id, player1_id, player2_id, status }) {
        this.id = id;
        this.player1_id = player1_id;
        this.player2_id = player2_id;
        this.status = status;
    }

    isFull() {
        return this.player1_id != null && this.player2_id != null;
    }

    static async create(player1Id) {
        const [result] = await db.query('INSERT INTO rooms (player1_id) VALUES (?)', [player1Id]);
        return new Room({ id: result.insertId, player1_id: player1Id, player2_id: null, status: 'waiting' });
    }

    static async findWaitingRoom() {
        const [rows] = await db.query('SELECT * FROM rooms WHERE status = "waiting" LIMIT 1');
        return rows.length ? new Room(rows[0]) : null;
    }

    async join(player2Id) {
        if (player2Id === this.player1_id) {
            throw new Error('A player cannot join a room with themselves.');
        }
        if (this.isFull()) {
            throw new Error('Room is already full.');
        }

        await db.query('UPDATE rooms SET player2_id = ?, status = "active" WHERE id = ?', [player2Id, this.id]);
        this.player2_id = player2Id;
        this.status = 'active';
    }

    static async findById(roomId) {
        try {
            const [rows] = await db.query('SELECT * FROM rooms WHERE id = ?', [roomId]);
            if (rows.length === 0) {
                return null; // Room not found
            }
            return new Room(rows[0]);
        } catch (error) {
            console.error('Error finding room by ID:', error);
            throw error;
        }
    }
}

module.exports = Room;