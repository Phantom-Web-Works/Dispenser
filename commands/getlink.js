const { SlashCommandBuilder } = require('@discordjs/builders');
const { AttachmentBuilder } = require('discord.js');
const config = require('../config.json');
const { Link } = require('../models/linkSchema');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('getlink')
    .setDescription('Retrieve links and send as a txt file')
    .addIntegerOption(option =>
      option.setName('count')
        .setDescription('Number of links to retrieve')
        .setRequired(false)
    )
    .addStringOption(option =>
      option.setName('type')
        .setDescription('Type of link to retrieve (Free, Premium, ALL)')
        .setRequired(false)
        .addChoices(
          { name: 'Free', value: 'Free' },
          { name: 'Premium', value: 'Premium' },
          { name: 'ALL', value: 'All' },
        )
    ),
  async execute(interaction) {
    const user = interaction.user;
    const ownerId = config.owner.id;

    if (user.id !== ownerId) {
      return interaction.reply({
        content: '**Error:** You do not have permission to use this command.',
        ephemeral: true
      });
    }

    const count = interaction.options.getInteger('count') || Number.MAX_SAFE_INTEGER;
    const type = interaction.options.getString('type') || 'ALL';

    try {
      let links;

      if (type === 'ALL') {
        links = await Link.find().limit(count).lean();
      } else {
        links = await Link.find({ type }).limit(count).lean();
      }

      if (!links || links.length === 0) {
        return interaction.reply({
          content: '**Error:** No links found with the specified criteria.',
          ephemeral: true
        });
      }

      const linkText = links.map(link => `${link.type}: ${link.url}`).join('\n');
      const attachment = new AttachmentBuilder(Buffer.from(linkText), { name: 'links.txt' });

      return interaction.reply({
        content: `**Success:** Retrieved ${links.length} link(s) with type ${type}.`,
        files: [attachment],
        ephemeral: true
      });
    } catch (error) {
      console.error('Error during getlink execution:', error);
      return interaction.reply({
        content: '**Error:** An unexpected error occurred.',
        ephemeral: true
      });
    }
  },
};
