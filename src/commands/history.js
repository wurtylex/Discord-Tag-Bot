const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder } = require('discord.js');
const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '../../tag_game.db');
const db = new Database(dbPath);

module.exports = {
  data: new SlashCommandBuilder()
    .setName('history')
    .setDescription('Fetches the tag history.')
    .addIntegerOption(option => 
      option.setName('page')
        .setDescription('The page number of the history to display.')
        .setRequired(false)
    ),

  async execute(interaction) {
    let page = interaction.options.getInteger('page') || 1;
    const historyLimit = 5;
    const offset = (page - 1) * historyLimit;

    const history = db.prepare('SELECT * FROM history ORDER BY timestamp DESC LIMIT ? OFFSET ?').all(historyLimit, offset);

    if (history.length === 0) {
      return interaction.reply({
        content: 'No tag history found!',
        flags: 64,
      });
    }

    const embed = new EmbedBuilder()
      .setTitle('Tag History')
      .setColor('#0099ff')
      .setDescription('Here are the most recent tag actions:')
      .setTimestamp();

    history.forEach((record, index) => {
      embed.addFields({
        name: ``,
        value: `<@${record.tagger_id}> tagged <@${record.tagged_id}>`,
      });
    });

    const row = new ActionRowBuilder();

    // Do we need to add pagination buttons?
    if (page > 1) {
      row.addComponents(
        new ButtonBuilder()
          .setCustomId('previous')
          .setLabel('Previous')
          .setStyle('Primary')
      );
    }

    if (history.length === historyLimit) {
      row.addComponents(
        new ButtonBuilder()
          .setCustomId('next')
          .setLabel('Next')
          .setStyle('Primary')
      );
    }

    await interaction.reply({
      embeds: [embed],
      components: row.components.length > 0 ? [row] : [],
    });

    const filter = (i) => i.user.id === interaction.user.id;
    const collector = interaction.channel.createMessageComponentCollector({ filter, time: 60000 });

    collector.on('collect', async (i) => {
      if (i.customId === 'previous') {
        await this.showPage(interaction, page - 1);
      }

      if (i.customId === 'next') {
        await this.showPage(interaction, page + 1);
      }

      await i.deferUpdate();
    });

    collector.on('end', () => {
        row.components.forEach((button) => button.setDisabled(true));
        interaction.editReply({ components: [row] });
    });

  },

  async showPage(interaction, page) {
    const historyLimit = 5;
    const offset = (page - 1) * historyLimit;

    const history = db.prepare('SELECT * FROM history ORDER BY timestamp DESC LIMIT ? OFFSET ?').all(historyLimit, offset);

    if (history.length === 0) {
      return interaction.reply({
        content: 'No more tag history found!',
        flags: 64,
      });
    }

    const embed = new EmbedBuilder()
      .setTitle('Tag History')
      .setColor('#0099ff')
      .setDescription('Here are the most recent tag actions:')
      .setTimestamp();

    history.forEach((record, index) => {
      embed.addFields({
        name: ``,
        value: `<@${record.tagger_id}> tagged <@${record.tagged_id}>`,
      });
    });

    const row = new ActionRowBuilder();

    if (page > 1) {
      row.addComponents(
        new ButtonBuilder()
          .setCustomId('previous')
          .setLabel('Previous')
          .setStyle('Primary')
      );
    }

    if (history.length === historyLimit) {
      row.addComponents(
        new ButtonBuilder()
          .setCustomId('next')
          .setLabel('Next')
          .setStyle('Primary')
      );
    }

    // Update the original message with new content and buttons
    await interaction.editReply({
      embeds: [embed],
      components: row.components.length > 0 ? [row] : [],
    });
  },
};