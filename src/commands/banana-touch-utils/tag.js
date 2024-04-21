const { SlashCommandBuilder } = require('discord.js');
const { channel_alerts, member, tagger, alerts } = require('../../../roles.json');
const { Tags } = require('../../database.js');
const tree = require('../../RBmaintainer.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('tag')
        .setDescription('Gets rid of your own tag and hands it to the person you tag.')
        .addUserOption(option => 
            option.setName('user')
                .setDescription('The user you want to tag')
                .setRequired(true)),
    async execute(interaction) {
        // Check for premissions 
        const hasRoles = [member, tagger].every(roleName => interaction.member.roles.cache.some(role => role.name === roleName));

        if (!hasRoles) {
            return interaction.reply('You do not have permission to use this command.');
        }

        // Grab and check user 
        const user = interaction.options.getMember('user');
        if (!user) { return interaction.reply('User not found.'); }

        await user.fetch();

        if (user.roles.cache.some(role => role.name === tagger)) {
            return interaction.reply(`You can't tag someone with the tag. That's like cutting the leg off of a guy who doesn't have his legs!`)
        }

        if (user.roles.cache.some(role => role.name === member)) {
            // Update the user 
            await interaction.member.roles.remove(interaction.guild.roles.cache.find(role => role.name === tagger));
            await user.roles.add(interaction.guild.roles.cache.find(role => role.name === tagger));
            await interaction.reply(`${user} is it! Congrats for getting rid of your tag!`);

            // update the tree and the database
            await tree.upgrade(user.id.toString()); 
            await Tags.increment('times_tagged', { where: { id: user.id } });
            await tree.printTree();

            const order = tree.getInOrder().flat();
            const chunks = [];
            const remainder = order.length % 4;
            const chunkSize = (order.length - remainder) / 4;

            for (let i = 0; i < remainder; i++) {
                chunks.push(order.slice(i * (chunkSize + 1), (i + 1) * (chunkSize + 1)));
            }

            for (let i = remainder; i < 4; i++) {
                chunks.push(order.slice(i * chunkSize + remainder, (i + 1) * chunkSize + remainder));
            }

            const userChunk = chunks.findIndex(chunk => chunk.includes(user.id));
            const memberChunk = chunks.findIndex(chunk => chunk.includes(interaction.member.id));

            const goldToAddRemove = memberChunk - userChunk;
            await Tags.decrement('gold', { where: { id: user.id }, by: goldToAddRemove });
            await Tags.increment('gold', { where: { id: interaction.member.id }, by: goldToAddRemove });
            await Tags.update({ tagged: 0 }, { where: { id: interaction.member.id } });
            await Tags.update({ tagged: 1 }, { where: { id: user.id } });

            const memberTags = await Tags.findOne({ where: { id: interaction.member.id } });

            if (memberTags.gold <= 0) {
                const banDuration = 3;
                const bannedUntil = new Date();
                bannedUntil.setDate(bannedUntil.getDate() + banDuration);
                await Tags.update({ banned: true, banned_until: bannedUntil }, { where: { id: interaction.member.id } });
                await interaction.member.roles.set([]);
            }

            const userTags = await Tags.findOne({ where: { id: user.id } });
            
            if (userTags.bounty) {
                userTags.bounty = false; 
                await userTags.save();

                Tags.increment('gold', { where: { id: interaction.member.id }, by: 5 });
            }

            if (userTags.gold <= 0) {
                const banDuration = 3;
                const bannedUntil = new Date();
                bannedUntil.setDate(bannedUntil.getDate() + banDuration);
                await Tags.update({ banned: true, banned_until: bannedUntil }, { where: { id: user.id } });
                await user.roles.set([]);
            }

            const channel = interaction.guild.channels.cache.find(channel => channel.name === channel_alerts);
            // Send message public humiliation
            if (channel && channel.type == 0) {
                const role = interaction.guild.roles.cache.find(role => role.name === alerts)
                channel.send(`${role}. The player ${user} is it!`);
            } else {
                console.error('Channel not found or not a text channel.');
            }
        } else {
            await interaction.reply(`${user} is not a Banana Evader! You can't tag a non-player that's like beating up a little kid.`);
        }
    },
};