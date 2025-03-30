const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '../../tag_game.db');
const db = new Database(dbPath);

async function syncServerState(guild) {
    try {
        const players = db.prepare('SELECT discord_id, is_tagger FROM game_state').all();

        const bananaRole = guild.roles.cache.find(role => role.name === 'Banana');
        const toucherRole = guild.roles.cache.find(role => role.name === 'Banana Toucher');

        if (!bananaRole || !toucherRole) {
            console.error('Banana or Banana Toucher role not found! Ensure /init was run.');
            return;
        }

        for (const player of players) {
            const member = await guild.members.fetch(player.discord_id).catch(() => null);
            if (!member) continue;

            const hasBananaRole = member.roles.cache.has(bananaRole.id);
            const hasToucherRole = member.roles.cache.has(toucherRole.id);

            if (player.is_tagger) {
                if (!hasBananaRole) await member.roles.add(bananaRole);
                if (!hasToucherRole) await member.roles.add(toucherRole);
            } else {
                if (!hasBananaRole) await member.roles.add(bananaRole);
                if (hasToucherRole) await member.roles.remove(toucherRole);
            }
        }

        console.log('Server state synced successfully.');
    } catch (error) {
        console.error('Error syncing server state:', error);
    }
}

module.exports = { syncServerState };