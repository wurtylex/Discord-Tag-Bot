const { SlashCommandBuilder } = require('discord.js');
const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '../../tag_game.db');
const db = new Database(dbPath);

module.exports = {  
    data: new SlashCommandBuilder()
        .setName('join')
        .setDescription('Join banana touch.'),
    async execute(interaction) {
        const userID = interaction.user.id;
    
        const existingUser = db.prepare('SELECT * FROM game_state WHERE discord_id = ?').get(userID);
    
        if (existingUser) {
            return interaction.reply({ content: 'You are already in the game!', flags: 64 });
        }
    
        db.prepare('INSERT INTO game_state (discord_id, is_tagger) VALUES (?, ?)').run(userID, 0);
    
        interaction.reply({ content: 'You have joined Banana Touch!', flags: 0 });
    }

}