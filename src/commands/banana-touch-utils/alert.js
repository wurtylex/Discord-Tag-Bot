const { SlashCommandBuilder } = require('discord.js');
const { alerts } = require('../../../roles.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('alert')
        .setDescription('Registers a member for alerts! Using it with the role takes it off.'),
    async execute(interaction) {
        let roleToAssign = interaction.guild.roles.cache.find(role => role.name === alerts);

        if (interaction.member.roles.cache.some(role => role.id === roleToAssign.id)) { 
            const roleToRemove = interaction.guild.roles.cache.find(role => role.name === roleName);
            await interaction.member.roles.remove(roleToRemove);
            return interaction.reply('Removing you from alerts!'); 
        }

        try {
            await interaction.member.roles.add(roleToAssign);
            await interaction.reply('Now part of alerts!');
        } catch (error) {
            console.error('Failed to register member:', error);
            await interaction.reply('Failed to add alerts. Please try again later.');
        }
    },
};