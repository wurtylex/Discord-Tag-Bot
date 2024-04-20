const { SlashCommandBuilder, ChannelType, PermissionsBitField } = require('discord.js');
const { channel_alerts, alerts, member, tagger } = require('../../../roles.json');
const { Tags } = require('../../database.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('init')
        .setDescription('Initalizes all roles and setups up needed channels in an order that works.')
        .setDefaultMemberPermissions(PermissionsBitField.Administrator),
    async execute(interaction) {
        if (!(interaction.guild.ownerId === interaction.user.id)) return interaction.reply('Owner only command, superseeds all permissions.'); 

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

        await interaction.guild.members.fetch().catch(console.error);

        const role = interaction.guild.roles.cache.find(role => role.name === member);

        if (role) {
            const memberIds = interaction.guild.members.cache.filter(member => member.roles.cache.has(role.id)).map(member => member.id);
            for (const id of memberIds) {
                try {
                    await Tags.upsert({
                        id: id,
                        lastTagged: null,
                        times_tagged: 0,
                        gold: 10
                    });
                } catch (error) {
                    console.log('Failed to add user to database:', error);
                }
            }
        } else {
            console.log('Role not found.');
        }

        channel.messages.fetch().then(async (messages) => {
            let pings = {};
            messages.forEach(message => {
                if (message.mentions.users.size > 0) {
                    message.mentions.users.forEach(user => {
                        if (!pings[user.id]) {
                            pings[user.id] = { count: 0, latest: null };
                        }
                        pings[user.id].count += 1;
                        if (!pings[user.id].latest || message.createdAt > pings[user.id].latest) {
                            pings[user.id].latest = message.createdAt;
                        }
                    });
                }
            });

            for (let id in pings) {
                try {
                    await Tags.upsert({
                        id: id,
                        lastTagged: pings[id].latest,
                        times_tagged: pings[id].count
                    });
                }
                catch (error) {
                    console.log('Failed to register member:', error);
                }
            }
        }).catch(console.error);

        return interaction.reply('Server properly setup.');
    },
};