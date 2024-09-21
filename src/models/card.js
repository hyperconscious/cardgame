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
            const cards = rows.map(row => new Card(row));
            return cards;
        } catch (error) {
            console.error('Error get all cards:', error);
            throw error;
        }
    }

    static async getRandCard() {
        try {
            const [rows] = await db.query('SELECT id, character_name, avatar, attack, defense FROM cards ORDER BY RAND() LIMIT 1');
            return rows[0];
        } catch (error) {
            console.error('Error finding random card:', error);
            throw error;
        }
    }
}

module.exports = Card;