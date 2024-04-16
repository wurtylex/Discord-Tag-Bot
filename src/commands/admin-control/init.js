const { SlashCommandBuilder, ChannelType, PermissionsBitField } = require('discord.js');
const { channel_alerts, alerts, member, tagger } = require('../../../roles.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('init')
        .setDescription('Initalizes all roles in an order that works.'),
    async execute(interaction) {
        async function createRole(guild, roleName, options) {
            let creation = guild.roles.cache.find(role => role.name === roleName);
        
            if (!creation) {
                try {
                    roleToAssign = await guild.roles.create({
                        name: roleName,
                        ...options
                    });
                } catch (error) {
                    console.error('Failed to create the role:', error);
                    throw new Error('Failed to register member. Please try again later.');
                }
            }
        }
        const admin = interaction.member.permissionsIn(interaction.channel).has(PermissionsBitField.Flags.Administrator);

        if (!admin) {
            return interaction.reply('Admin only command.');
        }

        try {
            await createRole(interaction.guild, alerts, {
                color: '#FF474C',
                mentionable: true
            });
        
            await createRole(interaction.guild, member, {
                color: '#ADD8E6',
                hoist: true,
                mentionable: true
            });
        
            await createRole(interaction.guild, tagger, {
                color: '#880808',
                hoist: true,
                mentionable: true,
                position: Math.max(...interaction.guild.roles.cache.map(role => role.position)) - 1
            });
        } catch (error) {
            return interaction.reply(error.message);
        }

        const channel = interaction.guild.channels.cache.find(channel => channel.name === channel_alerts);
        
        if(!channel) {
            interaction.guild.channels.create({
                name: channel_alerts, 
                type: ChannelType.GuildText,
                permissionOverwrites: [
                    {
                        id: interaction.guild.roles.everyone,
                        deny: [PermissionsBitField.Flags.SendMessages]
                    }
                ]
            })
            .then(channel => {
                console.log(`Channel created: ${channel.name}`);
            })
            .catch(console.error);
        }
        return interaction.reply('Server properly setup.');
    },
};