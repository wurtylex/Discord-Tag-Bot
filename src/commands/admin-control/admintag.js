const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js') 
const { channel_alerts, member, tagger, alerts } = require('../../../roles.json');
const { Tags } = require('../../database.js');
const tree = require('../../RBmaintainer.js');

module.exports = {
    data: new SlashCommandBuilder() 
        .setName('admintag')
        .setDescription('Takes in two users and swaps who has the tag.')
        .addUserOption(option => 
            option
                .setName('predator')
                .setDescription('the one who tagged')
                .setRequired(true)
        )
        .addUserOption(option =>
            option
                .setName('prey')
                .setDescription('the one who got tagged')
                .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction) {
        const predator = interaction.options.getMember('predator');
        const prey = interaction.options.getMember('prey'); 
        if (!predator || !prey) return interaction.reply('Not valid memebers. Choose other memebrs to make this work.');

        await predator.fetch(); 
        await prey.fetch(); 

        await tree.upgrade(prey.id.toString()); 
        await Tags.increment('times_tagged', { where: { id: prey.id } });
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

        const userChunk = chunks.findIndex(chunk => chunk.includes(prey.id));
        const memberChunk = chunks.findIndex(chunk => chunk.includes(predator.id));

        const goldToAddRemove = memberChunk - userChunk;
        await Tags.decrement('gold', { where: { id: prey.id }, by: goldToAddRemove });
        await Tags.increment('gold', { where: { id: predator.id }, by: goldToAddRemove });
        await Tags.update({ tagged: 0 }, { where: { id: predator.id } });
        await Tags.update({ tagged: 1 }, { where: { id: prey.id } });

        const memberTags = await Tags.findOne({ where: { id: predator.id } });

        if (memberTags.gold <= 0) {
            const banDuration = 3;
            const bannedUntil = new Date();
            bannedUntil.setDate(bannedUntil.getDate() + banDuration);
            await Tags.update({ banned: true, banned_until: bannedUntil }, { where: { id: predator.id } });
            await interaction.member.roles.set([]);
        }

        const userTags = await Tags.findOne({ where: { id: prey.id } });
        
        if (userTags.bounty) {
            userTags.bounty = false; 
            await userTags.save();

            Tags.increment('gold', { where: { id: predator.id }, by: 5 });
        }

        if (userTags.gold <= 0) {
            const banDuration = 3;
            const bannedUntil = new Date();
            bannedUntil.setDate(bannedUntil.getDate() + banDuration);
            await Tags.update({ banned: true, banned_until: bannedUntil }, { where: { id: prey.id } });
            await user.roles.set([]);
        }

        if (predator.roles.cache.some(role => role.name === tagger) && !prey.roles.cache.some(role => role.name === tagger) && prey.roles.cache.some(role => role.name === member)) {
            await predator.roles.remove(interaction.guild.roles.cache.find(role => role.name === tagger));
            await prey.roles.add(interaction.guild.roles.cache.find(role => role.name === tagger));
            await interaction.reply(`Tag has been passed from ${predator} to ${prey}.`);

            // update the tree and the database
            await tree.upgrade(prey.id.toString()); 
            await Tags.increment('times_tagged', { where: { id: prey.id } });
            await tree.printTree();

            const channel = interaction.guild.channels.cache.find(channel => channel.name === channel_alerts);
            // Send message public humiliation
            if (channel && channel.type == 0) {
                const role = interaction.guild.roles.cache.find(role => role.name === alerts)
                channel.send(`${role}. The player ${prey} is it!`);
            } else {
                console.error('Channel not found or not a text channel.');
            }
        } else {
            return await interaction.reply('Not a valid set.');
        }
    }
}