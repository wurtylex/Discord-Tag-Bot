const { SlashCommandBuilder, EmbedBuilder, ButtonStyle, ButtonBuilder, ActionRowBuilder } = require('discord.js');
const { Tags } = require('../../database.js');
const tree = require('../../RBmaintainer.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('scoreboard')
        .setDescription('Displays the current scoreboard (how many been tagged) of the Banana Touch game'),
    async execute(interaction) {
        const tags_ids = tree.getInOrder();
        ids = tags_ids.flat(); 

        function chunkArray(arr) {
            const chunkedArray = [];
            for (let i = 0; i < arr.length; i += 5) {
                chunkedArray.push(arr.slice(i, i + 5));
            }
            return chunkedArray;
        }

        ids = chunkArray(ids);

        const backward = new ButtonBuilder()
            .setCustomId('backward')
            .setEmoji('◀️')
            .setStyle(ButtonStyle.Secondary)

        const forward = new ButtonBuilder()
            .setCustomId('forward')
            .setEmoji('▶️')
            .setStyle(ButtonStyle.Secondary)

        const buttons = new ActionRowBuilder()
            .addComponents(backward, forward)

        const embeds = await Promise.all(ids.map(async (idChunk, index) => {
            const embed = new EmbedBuilder()
                .setTitle(`Hall of Shame! Page: ${index + 1}`)
                .setTimestamp()
                .setColor('#FFD700');
            let tempRank = 1; 

            await Promise.all(idChunk.map(async (id) => {
                const user = await interaction.guild.members.fetch(id);
                const tag = await Tags.findOne({ where: { id: id } });
                const times_tagged = tag ? tag.times_tagged : 0;
                let rank = index * 5 + tempRank++;
                await embed.addFields({ name: `#${rank}. ${user.user.username}`, value: `${times_tagged} holds of tag.` });
            }));

            return embed;
        }));

        let page = 0; 

        const message = await interaction.reply({ embeds: [embeds[page]], components: [buttons], fetchReply: true });
        // const collectorFilter = i => i.user.id === interaction.user.id;
        const collector = message.createMessageComponentCollector({ time: 300000 });

        let inactivityTimeout = setTimeout(() => { message.edit({ components: [] }); }, 30000);

        collector.on('collect', async (i) => {
            if (i.user.id !== interaction.user.id) {
                return await i.reply({ content: 'You are not allowed to use this button.', ephemeral: true });
            }

            if (i.customId === 'backward') {
                page = page > 0 ? --page : embeds.length - 1;
            } else if (i.customId === 'forward') {
                page = page + 1 < embeds.length ? ++page : 0;
            }
    
            await i.update({ embeds: [embeds[page]], components: [buttons] });

            clearTimeout(inactivityTimeout); inactivityTimeout = setTimeout(() => { message.edit({ components: [] }); }, 30000);
        });
    }
}