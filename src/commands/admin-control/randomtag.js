const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js') 
const { channel_alerts, member, tagger, alerts } = require('../../../roles.json');
const { Tags } = require('../../database.js');
const tree = require('../../RBmaintainer.js');

function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

module.exports = {
    data: new SlashCommandBuilder() 
        .setName('randomtag')
        .setDescription('Chooses someone at random to give the tag to.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction) {
        let participants = tree.getInOrder();
        await interaction.guild.members.fetch();
        const taggerRole = interaction.guild.roles.cache.find(role => role.name === tagger);

        for (let i = participants.length - 1; i >= 0; i--) {
            if (0.5 < Math.random()) {
                const potentialTaggerID = participants[i][getRandomInt(participants[i].length)]; 
                const potentialTaggerMember = await interaction.guild.members.fetch(potentialTaggerID);
                if (!potentialTaggerMember.roles.cache.has(taggerRole.id)) {
                    await potentialTaggerMember.roles.add(taggerRole);
                    return await interaction.reply(`The player ${potentialTaggerMember} is it!`);
                }
            }
            if (i == 0) i = participants.length - 1;
        }
    }
}