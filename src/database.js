const Sequelize = require('sequelize'); 

Sequelize.DATE.prototype._stringify = function _stringify(date, options) {
    return this._applyTimezone(date, options).format('YYYY-MM-DD HH:mm:ss');
};

const sequelize = new Sequelize('database', 'user', 'password', {
    host: 'localhost',
    dialect: 'sqlite', 
    logging: false, 
    storage: 'database.sqlite'
});

const Tags = sequelize.define('tags', { 
    id: {
        type: Sequelize.STRING,
        unique: true,
        primaryKey: true,
    },
    lastTagged: Sequelize.DATE,
    times_tagged: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false,
    },
    gold: {
        type: Sequelize.INTEGER,
        defaultValue: 10,
        allowNull: false,
    },
});

module.exports = { Tags, sequelize };