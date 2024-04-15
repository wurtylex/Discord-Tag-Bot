const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('tag')
        .setDescription('Gets rid of your own tag and hands it to the person you tag.')
        .addUserOption(option => 
            option.setName('user')
                .setDescription('The user you want to tag')
                .setRequired(true)),
    async execute(interaction) {
        const hasBananaEvadersRole = interaction.member.roles.cache.some(role => role.name === 'Banana Evaders');
        const hasSoiledBananaRole = interaction.member.roles.cache.some(role => role.name === 'Soiled Banana');
    
        const isAdmin = interaction.member.permissionsIn(interaction.channel).has(PermissionsBitField.Flags.Administrator);

        if (!(hasBananaEvadersRole && hasSoiledBananaRole) && !isAdmin) {
            return interaction.reply('You do not have permission to use this command.');
        }

        const roleName = 'Soiled Banana';
        const highestAccessable = interaction.guild.roles.cache.reduce((prev, role) => (prev.position > role.position ? prev : role)).position;

        let roleToAssign = interaction.guild.roles.cache.find(role => role.name === roleName);

        if (!roleToAssign) {
            try {
                roleToAssign = await interaction.guild.roles.create({
                    name: roleName,
                    color: '#880808',
                    hoist: true,
                    mentionable: true,
                    position: highestAccessable - 1,
                });
            } catch (error) {
                console.error('Failed to create the role:', error);
                return interaction.reply('Failed to register member. Please try again later.');
            }
        }

        // Grab and check user 
        const user = interaction.options.getMember('user');
        if (!user) { return interaction.reply('User not found.'); }

        await user.fetch();
        const userHasBananaEvadersRole = user.roles.cache.some(role => role.name === 'Banana Evaders');
        const userHasSoiledBananaRole = user.roles.cache.some(role => role.name === 'Soiled Banana');

        if (userHasSoiledBananaRole) {
            return interaction.reply(`You can't tag someone with the tag. That's like cutting the leg off of a guy who doesn't have his legs!`)
        }


        const channelId = "1228245395570819134";
        const channel = interaction.guild.channels.cache.get(channelId);

        if (userHasBananaEvadersRole) {
            const roleToRemove = interaction.guild.roles.cache.find(role => role.name === 'Soiled Banana');
            await interaction.member.roles.remove(roleToRemove);
            await user.roles.add(roleToAssign);
            await interaction.reply(`${user} is it! Congrats for getting rid of your tag!`);

            if (channel && channel.type == 0) {
                const roleId = '1228337175582605393'; 
                const roleMention = `<@&${roleId}>`;
                channel.send(`${roleMention} ${user} is it!`);
            } else {
                console.error('Channel not found or not a text channel.');
            }
        } else {
            await interaction.reply(`${user} is not a Banana Evader! You can't tag a non-player that's like beating up a little kid.`);
        }
    },
};