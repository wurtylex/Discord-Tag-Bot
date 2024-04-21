const { SlashCommandBuilder } = require('discord.js');
const { member } = require('../../../roles.json');
const { Tags } = require('../../database.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('register')
        .setDescription('Registers a member by assigning them the Banana Evaders role'),
    async execute(interaction) {
        let roleToAssign = interaction.guild.roles.cache.find(role => role.name === member);

        const tag = await Tags.findOne({ where: { id: interaction.member.id } });

        if (tag.banned) { 
            const currentTime = new Date();
            if (currentTime > tag.banned_until) {
                tag.banned = false; 
                tag.banned_until = null; 
            }
            else return interaction.reply(`You are banned from the game. Until ${tag.banned_until.toUTCString()}`); 
        }
        if (interaction.member.roles.cache.some(role => role.id === roleToAssign.id)) { 
            return interaction.reply('You are already registered.'); 
        }

        try {
            await interaction.member.roles.add(roleToAssign);
            await interaction.reply('Successfully registered!');
            const existingTag = await Tags.findOne({ where: { id: interaction.member.id } });
            if (existingTag) {
                existingTag.gold = 10;
                await existingTag.save();
            } else {
                await Tags.create({
                    id: id,
                    lastTagged: null,
                    times_tagged: 0,
                    gold: 10,
                    tagged: false,
                    banned: false,
                    banned_until: null,
                    bounty: false,
                });
            }
        } catch (error) {
            console.error('Failed to register member:', error);
            await interaction.reply('Failed to register member. Please try again later.');
        }
    },
};