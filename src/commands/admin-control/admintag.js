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

        if (predator.roles.cache.some(role => role.name === tagger) && !prey.roles.cache.some(role => role.name === tagger) && prey.roles.cache.some(role => role.name === member)) {
            await predator.roles.remove(interaction.guild.roles.cache.find(role => role.name === tagger));
            await prey.roles.add(interaction.guild.roles.cache.find(role => role.name === tagger));
            await interaction.reply(`Tag has been passed from ${predator} to ${prey}.`);

            // update the tree and the database
            await tree.upgrade(prey.id.toString()); 
            Tags.increment('times_tagged', { where: { id: prey.id } });

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