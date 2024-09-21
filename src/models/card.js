const db = require('../../config/db');

class Card {
    constructor({id, character_name, avatar, attack, defence }) {
        this.id = id;
        this.character_name = character_name;
        this.avatar = avatar;
        this.attack = attack;
        this.defence = defence;
    }

    static async getAllCards() {
        try {
            const [rows] = await db.query('SELECT id, character_name, avatar, attack, defense FROM cards');
            let rooms = new Array(rows.length);
            console.log('dead');
            return new Card(rows[0]);
        } catch (error) {
            console.error('Error finding room by ID:', error);
            throw error;
        }
    }
}

module.exports = Card;