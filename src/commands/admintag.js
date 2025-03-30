const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '../../tag_game.db');
const db = new Database(dbPath);

module.exports = {
    data: new SlashCommandBuilder()
        .setName('admintag')
        .setDescription('Forcefully transfer the tag to another player (Admin Only).')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator) // Restrict to admins
        .addUserOption(option => 
            option.setName('tagger')
                .setDescription('The current tag holder')
                .setRequired(true))
        .addUserOption(option => 
            option.setName('tagged')
                .setDescription('The player to receive the tag')
                .setRequired(true)),
    
    async execute(interaction) {
        const taggerID = interaction.options.getUser('tagger').id;
        const taggedID = interaction.options.getUser('tagged').id;

        const taggerDB = db.prepare('SELECT * FROM game_state WHERE discord_id = ?').get(taggerID);
        const taggedDB = db.prepare('SELECT * FROM game_state WHERE discord_id = ?').get(taggedID);

        if (!taggerDB) return interaction.reply({ content: 'The selected tagger is not in the game!', flags: 64 });
        if (!taggedDB) return interaction.reply({ content: 'The selected player is not in the game!', flags: 64 });
        if (taggerDB.is_tagger === 0) return interaction.reply({ content: 'The selected tagger is not currently a banana toucher!', flags: 64 });
        if (taggedDB.is_tagger === 1) return interaction.reply({ content: 'The selected player is already a banana toucher!', flags: 64 });

        db.prepare('UPDATE game_state SET is_tagger = 0 WHERE discord_id = ?').run(taggerID);
        db.prepare('UPDATE game_state SET is_tagger = 1 WHERE discord_id = ?').run(taggedID);

        db.prepare('INSERT INTO history (tagger_id, tagged_id) VALUES (?, ?)').run(taggerID, taggedID);
        
        interaction.reply({ content: `Admin has forcibly transferred the tag from <@${taggerID}> to <@${taggedID}>!`, flags: 0 });
    }
};