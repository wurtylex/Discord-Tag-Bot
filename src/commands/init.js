const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '../../tag_game.db');

const db = new Database(dbPath);

db.prepare(`CREATE TABLE IF NOT EXISTS game_state (
    discord_id TEXT PRIMARY KEY,
    is_tagger BOOLEAN NOT NULL DEFAULT 0
)`).run();
db.prepare(`CREATE TABLE IF NOT EXISTS history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tagger_id TEXT NOT NULL,
    tagged_id TEXT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
)`).run();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('init')
        .setDescription('Initializes the tag game and sets up roles.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    
    async execute(interaction) {
        const guild = interaction.guild;
        
        let toucherRole = guild.roles.cache.find(role => role.name === 'Banana Toucher');
        let bananaRole = guild.roles.cache.find(role => role.name === 'Banana');
        
        if (!toucherRole) {
            toucherRole = await guild.roles.create({ name: 'Banana Toucher', color: '#FFA500' });
        }
        if (!bananaRole) {
            bananaRole = await guild.roles.create({ name: 'Banana', color: '#FFFF00' });
        }
        
        interaction.reply({ content: 'Tag game has been initialized and roles have been set up!' });
    }
};