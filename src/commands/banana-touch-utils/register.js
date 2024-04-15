const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('register')
        .setDescription('Registers a member by assigning them the Banana Evaders role'),
    async execute(interaction) {
        const roleName = 'Banana Evaders';

        let roleToAssign = interaction.guild.roles.cache.find(role => role.name === roleName);

        if (!roleToAssign) {
            try {
                roleToAssign = await interaction.guild.roles.create({
                    name: roleName,
                    color: '#ADD8E6',
                    hoist: true,
                    mentionable: true,
                });
            } catch (error) {
                console.error('Failed to create the role:', error);
                return interaction.reply('Failed to register member. Please try again later.');
            }
        }

        if (interaction.member.roles.cache.some(role => role.id === roleToAssign.id)) { 
            return interaction.reply('You are already registered.'); 
        }

        try {
            await interaction.member.roles.add(roleToAssign);
            await interaction.reply('Successfully registered!');
        } catch (error) {
            console.error('Failed to register member:', error);
            await interaction.reply('Failed to register member. Please try again later.');
        }
    },
};