const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js') 
const { channel_alerts, member, tagger, alerts } = require('../../../roles.json');
const { Tags } = require('../../database.js');
const tree = require('../../RBmaintainer.js');

module.exports = {
    data: new SlashCommandBuilder() 
        .setName('randomtag')
        .setDescription('Chooses someone at random to give the tag to.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction) {
        //pass
    }
}