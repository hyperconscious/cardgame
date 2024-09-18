class Player extends Model {
    constructor(attributes) {
        super(attributes);
        this.wins = attributes.wins || 0;
        this.losses = attributes.losses || 0;
    }

    static get tableName() {
        return 'players';
    }

    async incrementWins() {
        this.wins += 1;
        await this.save();
    }

    async incrementLosses() {
        this.losses += 1;
        await this.save();
    }
}
