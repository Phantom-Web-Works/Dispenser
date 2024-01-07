const {EmbedBuilder, ModalBuilder, TextInputBuilder, ActionRowBuilder, TextInputStyle } = require('discord.js');
const { Link } = require('../models/linkSchema');
const config = require('../config.json');

const cooldowns = new Map();

module.exports = {
  data: {
    customId: 'report_link',
  },
  async execute(interaction) {
    try {
        const modal = new ModalBuilder()
        .setCustomId('report_Modal')
        .setTitle('Report A Link');
      const Link = new TextInputBuilder()
        .setCustomId('Link')
        .setLabel("Link")
        .setStyle(TextInputStyle.Short);

      const Error = new TextInputBuilder()
        .setCustomId('Error')
        .setLabel("Error")
        .setStyle(TextInputStyle.Short);

      const firstActionRow = new ActionRowBuilder().addComponents(Link);
      const secondActionRow = new ActionRowBuilder().addComponents(Error);

      modal.addComponents(firstActionRow, secondActionRow);
      await interaction.showModal(modal);
    } catch (error) {
        interaction.reply({ content: 'An error has occurred.', ephemeral: true });
    }
  },
};
