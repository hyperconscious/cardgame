const db = require('../../config/db');

class Card {
    constructor({id, character_name, avatar, attack, defense, cost}) {
        this.id = id;
        this.character_name = character_name;
        this.avatar = avatar;
        this.attack = attack;
        this.defense = defense;
        this.cost = cost;
    }

    static async getAllCards() {
        try {
            const [rows] = await db.query('SELECT id, character_name, avatar, attack, defense, cost FROM cards');
            const cards = rows.map(row => new Card(row));
            return cards;
        } catch (error) {
            console.error('Error get all cards:', error);
            throw error;
        }
    }

    static async getRandCard() {
        try {
            const [rows] = await db.query('SELECT id, character_name, avatar, attack, defense, cost FROM cards ORDER BY RAND() LIMIT 1');
            let card = new Card(rows[0]);
            console.log(card.avatar);
            return card;
        } catch (error) {
            console.error('Error finding random card:', error);
            throw error;
        }
    }
}

module.exports = Card;