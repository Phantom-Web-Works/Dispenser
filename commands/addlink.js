const { SlashCommandBuilder } = require('@discordjs/builders');
const config = require('../config.json');
const { Link } = require('../models/linkSchema');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('addlink')
    .setDescription('Add a new link to the database')
    .addStringOption(option =>
      option.setName('url')
        .setDescription('The URL to add')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('type')
        .setDescription('Type of link (Free or Premium)')
        .setRequired(true)
        .addChoices(
          { name: 'Free', value: 'Free' },
          { name: 'Premium', value: 'Premium' }
        )
    ),
  async execute(interaction) {
    const user = interaction.user;
    const ownerId = config.owner.id;
    const ownerRoleId = config.owner.role_id;
    const url = interaction.options.getString('url');
    const type = interaction.options.getString('type');

    if (user.id !== ownerId && !interaction.member.roles.cache.has(ownerRoleId)) {
      return interaction.reply({
        content: '**Error:** You do not have permission to use this command.',
        ephemeral: true
      });
    }

    try {
      const existingLink = await Link.findOne({ url });
      if (existingLink) {
        return interaction.reply({
          content: '**Error:** This link already exists in the database.',
          ephemeral: true
        });
      }

      const newLink = new Link({ url, type });
      await newLink.save();

      return interaction.reply({
        content: `**Success:** New ${type} link has been added to the database.`,
        ephemeral: true
      });
    } catch (error) {
      console.error('Error during addlink execution:', error);
      return interaction.reply({
        content: '**Error:** An unexpected error occurred.',
        ephemeral: true
      });
    }
  },
};
