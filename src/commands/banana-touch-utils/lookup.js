const { SlashCommandBuilder, EmbedBuilder, ButtonStyle, ButtonBuilder, ActionRowBuilder } = require('discord.js');
const { Tags } = require('../../database.js');
const tree = require('../../RBmaintainer.js');
const moment = require('moment-timezone')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('lookup')
        .setDescription('Displays information about user')
        .addUserOption(option => 
            option.setName('user')
                .setDescription('The user you want to lookup')
                .setRequired(false)),
    async execute(interaction) {
        const userId = interaction.options.getUser('user')?.id || interaction.member.id;
        const user = await interaction.client.users.fetch(userId);
        const tag = await Tags.findAll({ where: { id: user.id } });
        const tagData = tag[0];
        const lastTagged = tagData.lastTagged ? moment(tagData.lastTagged).tz('America/New_York').format('MMMM Do YYYY, h:mm:ss') : 'Never';
        const embed = new EmbedBuilder()
            .setTitle('User Data')
            .setDescription(`Data of ${user.username}`)
            .setThumbnail(user.displayAvatarURL())
            .addFields(
                { name: 'Times Tagged', value: tagData.times_tagged.toString(), inline: true },
                { name: 'Currently It', value: tagData.tagged ? 'Yes' : 'No', inline: true },
                { name: 'Last Tagged', value: lastTagged, inline: true },
                { name: 'Banned Until', value: tagData.banned ? moment(tagData.bannedUntil).tz('America/New_York').format('MMMM Do YYYY, h:mm:ss') : 'Not Banned', inline: true }
            )
            .setColor('#FFD700');

        await interaction.reply({ embeds: [embed] });
    }
}