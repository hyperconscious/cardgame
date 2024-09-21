const db = require('./config/db');

class Model {
    constructor(attributes) {
        Object.assign(this, attributes);
    }

    static get tableName() {
        throw new Error("Method 'tableName' must be implemented.");
    }

    static async find(id) {
        try {
            const [rows] = await db.query(`SELECT * FROM ${this.tableName} WHERE id = ?`, [id]);
            if (rows.length > 0) {
                return new this(rows[0]);
            } else {
                return null;
            }
        } catch (error) {
            console.error('Error finding record:', error);
            throw error;
        }
    }

    async delete() {
        try {
            const [result] = await db.query(`DELETE FROM ${this.constructor.tableName} WHERE id = ?`, [this.id]);
            return result.affectedRows > 0;
        } catch (error) {
            console.error('Error deleting record:', error);
            throw error;
        }
    }

    async save() {
        try {
            const existingRecord = await this.constructor.find(this.id);
            if (existingRecord) {
                const [result] = await db.query(
                    `UPDATE ${this.constructor.tableName} SET ? WHERE id = ?`,
                    [this, this.id]
                );
                return result.affectedRows > 0;
            } else {
                const [result] = await db.query(
                    `INSERT INTO ${this.constructor.tableName} SET ?`,
                    this
                );
                this.id = result.insertId;
                return true;
            }
        } catch (error) {
            console.error('Error saving record:', error);
            throw error;
        }
    }

}

module.exports = Model;
