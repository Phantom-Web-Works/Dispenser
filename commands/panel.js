const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const config = require('../config.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('panel')
    .setDescription('Display the Link Dispenser panel'),
  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setColor(config.embed.color)
      .setTitle(config.embed.title)
      .setDescription(config.embed.description)
      .setImage(config.embed.img)
      .setThumbnail(config.embed.thumbnail)
      .setFooter({
        text: config.embed.footer.text,
        iconURL: config.embed.footer.iconURL,
      })
      .setTimestamp();

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('free_link')
        .setLabel(config.buttons.free_name)
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId('premium_link')
        .setLabel(config.buttons.premium_name)
        .setStyle(ButtonStyle.Success),

      new ButtonBuilder()
        .setCustomId('report_link')
        .setLabel(config.buttons.report_name)
        .setStyle(ButtonStyle.Danger)
    );

    await interaction.reply({ embeds: [embed], components: [row] });
  },
};
