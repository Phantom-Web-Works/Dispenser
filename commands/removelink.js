const { SlashCommandBuilder } = require('@discordjs/builders');
const config = require('../config.json');
const { Link } = require('../models/linkSchema');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('removelink')
    .setDescription('Remove a link from the database')
    .addStringOption(option =>
      option.setName('url')
        .setDescription('The URL to remove')
        .setRequired(true)
    ),
  async execute(interaction) {
    const user = interaction.user;
    const ownerId = config.owner.id;
    const ownerRoleId = config.owner.role_id;
    const urlToRemove = interaction.options.getString('url');

    if (user.id !== ownerId && !interaction.member.roles.cache.has(ownerRoleId)) {
      return interaction.reply({
        content: '**Error:** You do not have permission to use this command.',
        ephemeral: true
      });
    }

    try {
      const removedLink = await Link.findOneAndDelete({ url: urlToRemove });

      if (!removedLink) {
        return interaction.reply({
          content: `**Error:** The specified link \`${urlToRemove}\` was not found in the database.`,
          ephemeral: true
        });
      }

      return interaction.reply({
        content: `**Success:** Link \`${urlToRemove}\` has been removed from the database.`,
        ephemeral: true
      });
    } catch (error) {
      console.error('Error during removelink execution:', error);
      return interaction.reply({
        content: '**Error:** An unexpected error occurred.',
        ephemeral: true
      });
    }
  },
};
