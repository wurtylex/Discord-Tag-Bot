const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('alert')
        .setDescription('Registers a member for alerts! Using it with the role takes it off.'),
    async execute(interaction) {
        const roleName = '!!! (alert)';

        let roleToAssign = interaction.guild.roles.cache.find(role => role.name === roleName);

        if (!roleToAssign) {
            try {
                roleToAssign = await interaction.guild.roles.create({
                    name: roleName,
                    color: '#FF474C',
                    mentionable: true,
                });
            } catch (error) {
                console.error('Failed to create the role:', error);
                return interaction.reply('Failed to register member. Please try again later.');
            }
        }

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