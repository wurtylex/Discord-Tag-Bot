const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '../../tag_game.db');
const db = new Database(dbPath);

module.exports = {
    data: new SlashCommandBuilder()
        .setName('randomtag')
        .setDescription('Randomly gives the tag to a player who doesn’t already have it.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction) {
        const eligiblePlayers = db.prepare('SELECT discord_id FROM game_state WHERE is_tagger = 0').all();

        if (eligiblePlayers.length === 0) {
            return interaction.reply({ content: 'No eligible players to receive the tag.', flags: 0 });
        }

        const randomPlayer = eligiblePlayers[Math.floor(Math.random() * eligiblePlayers.length)].discord_id;

        db.prepare('UPDATE game_state SET is_tagger = 1 WHERE discord_id = ?').run(randomPlayer);
        db.prepare('INSERT INTO history (tagger_id, tagged_id) VALUES (?, ?)').run('SYSTEM', randomPlayer);

        interaction.reply({ content: `<@${randomPlayer}> has been randomly selected as a Banana Toucher!` });
    }
};