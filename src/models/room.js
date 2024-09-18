const db = require('../../config/db');

class Room {
    constructor({ id, player1_id, player2_id, status }) {
        this.id = id;
        this.player1_id = player1_id;
        this.player2_id = player2_id;
        this.status = status;
    }

    static async create(player1Id) {
        const [result] = await db.query('INSERT INTO rooms (player1_id) VALUES (?)', [player1Id]);
        return new Room({ id: result.insertId, player1_id: player1Id, status: 'waiting' });
    }

    static async findWaitingRoom() {
        const [rows] = await db.query('SELECT * FROM rooms WHERE status = "waiting" LIMIT 1');
        return rows.length ? new Room(rows[0]) : null;
    }

    async join(player2Id) {
        await db.query('UPDATE rooms SET player2_id = ?, status = "active" WHERE id = ?', [player2Id, this.id]);
        this.player2_id = player2Id;
        this.status = 'active';
    }
}

module.exports = Room;