const { SlashCommandBuilder } = require('discord.js');
const { channel_alerts, member, tagger, alerts } = require('../../../roles.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('tag')
        .setDescription('Gets rid of your own tag and hands it to the person you tag.')
        .addUserOption(option => 
            option.setName('user')
                .setDescription('The user you want to tag')
                .setRequired(true)),
    async execute(interaction) {
        // Check for premissions 
        const hasRoles = [member, tagger].every(roleName => interaction.member.roles.cache.some(role => role.name === roleName));

        if (!hasRoles) {
            return interaction.reply('You do not have permission to use this command.');
        }

        // Grab and check user 
        const user = interaction.options.getMember('user');
        if (!user) { return interaction.reply('User not found.'); }

        await user.fetch();

        if (user.roles.cache.some(role => role.name === tagger)) {
            return interaction.reply(`You can't tag someone with the tag. That's like cutting the leg off of a guy who doesn't have his legs!`)
        }

        const channel = interaction.guild.channels.cache.find(channel => channel.name === channel_alerts);

        if (user.roles.cache.some(role => role.name === member)) {
            await interaction.member.roles.remove(interaction.guild.roles.cache.find(role => role.name === tagger));
            await user.roles.add(interaction.guild.roles.cache.find(role => role.name === tagger));
            await interaction.reply(`${user} is it! Congrats for getting rid of your tag!`);

            if (channel && channel.type == 0) {
                const role = interaction.guild.roles.cache.find(role => role.name === alerts)
                channel.send(`${role}. The player ${user} is it!`);
            } else {
                console.error('Channel not found or not a text channel.');
            }
        } else {
            await interaction.reply(`${user} is not a Banana Evader! You can't tag a non-player that's like beating up a little kid.`);
        }
    },
};