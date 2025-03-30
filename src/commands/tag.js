const { SlashCommandBuilder } = require('discord.js');
const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '../../tag_game.db');
const db = new Database(dbPath);

module.exports = {
    data: new SlashCommandBuilder()
        .setName('tag')
        .setDescription('Transfer the tag to another player.')
        .addUserOption(option => option.setName('player').setDescription('The player you want to tag').setRequired(true)),
    async execute(interaction) {
        const userID = interaction.user.id;
        const targetUserID = interaction.options.getUser('player').id;

        const userDB = db.prepare('SELECT * FROM game_state WHERE discord_id = ?').get(userID);
        const targetDB = db.prepare('SELECT * FROM game_state WHERE discord_id = ?').get(targetUserID);

        if (!userDB) return interaction.reply({ content: 'You are not in the game!', flags: 64 });
        if (!targetDB) return interaction.reply({ content: 'The target player is not in the game!', flags: 64 });
        if (userDB.is_tagger === 0) return interaction.reply({ content: 'You are not currently a banana toucher!', flags: 64 });
        if (targetDB.is_tagger === 1) return interaction.reply({ content: 'The target player is already a banana toucher!', flags: 64});

        db.prepare('UPDATE game_state SET is_tagger = 0 WHERE discord_id = ?').run(userID);
        db.prepare('UPDATE game_state SET is_tagger = 1 WHERE discord_id = ?').run(targetUserID);

        db.prepare('INSERT INTO history (tagger_id, tagged_id) VALUES (?, ?)').run(userID, targetUserID);
        interaction.reply({ content: `You have tagged <@${targetUserID}>!`, flags: 0 });
    }
}