const { SlashCommandBuilder } = require('discord.js');
const { member } = require('../../../roles.json');
const { Tags } = require('../../database.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('register')
        .setDescription('Registers a member by assigning them the Banana Evaders role'),
    async execute(interaction) {
        let roleToAssign = interaction.guild.roles.cache.find(role => role.name === member);

        if (interaction.member.roles.cache.some(role => role.id === roleToAssign.id)) { 
            return interaction.reply('You are already registered.'); 
        }

        try {
            await interaction.member.roles.add(roleToAssign);
            await interaction.reply('Successfully registered!');
            Tags.create({ id: interaction.member.id, times_tagged: 0, gold: 10 });
        } catch (error) {
            console.error('Failed to register member:', error);
            await interaction.reply('Failed to register member. Please try again later.');
        }
    },
};