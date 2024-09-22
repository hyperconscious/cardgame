const Model = require('../../model');
const db = require('../../config/db');
const bcrypt = require('bcrypt');

class User extends Model {
    static get tableName() {
        return 'users';
    }

    constructor(attributes) {
        super(attributes);
    }

    static async findByLogin(login) {
        try {
            const [rows] = await db.query(`SELECT * FROM ${this.tableName} WHERE login = ?`, [login]);
            return rows.length > 0 ? new this(rows[0]) : null;
        } catch (error) {
            console.error('Error finding user by login:', error);
            throw error;
        }
    }

    static async findById(id) {
        try {
            const [rows] = await db.query(`SELECT * FROM ${this.tableName} WHERE id = ?`, [id]);
            return rows.length > 0 ? new this(rows[0]) : null;
        } catch (error) {
            console.error('Error finding user by id:', error);
            throw error;
        }
    }

    static async findByEmail(email) {
        try {
            const [rows] = await db.query(`SELECT * FROM ${this.tableName} WHERE email = ?`, [email]);
            return rows.length > 0 ? new this(rows[0]) : null;
        } catch (error) {
            console.error('Error finding user by email:', error);
            throw error;
        }
    }

    async save() {
        try {
            if (this.id) {
                const [result] = await db.query(
                    `UPDATE ${this.constructor.tableName} SET ? WHERE id = ?`,
                    [this, this.id]
                );
                return result.affectedRows > 0;
            } else {
                const saltRounds = 10;
                this.password = await bcrypt.hash(this.password, saltRounds);

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

    async verifyPassword(password) {
        try {
            return await bcrypt.compare(password, this.password);
        } catch (error) {
            console.error('Error verifying password:', error);
            throw error;
        }
    }
}

module.exports = User;
