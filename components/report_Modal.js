const {EmbedBuilder } = require('discord.js');
const config = require('../config.json');


module.exports = {
  data: {
    customId: 'report_Modal',
  },
  async execute(interaction) {
    try {
        interaction.reply({content:"Link Reported!", ephemeral:true});
        const link = interaction.fields.getTextInputValue('Link');
        const error = interaction.fields.getTextInputValue('Error');
        const user = interaction.user;
        const footertext = `Reported by: ${user.tag}`;
      
        const reportEmbed = new EmbedBuilder()
          .setColor(15548997)
          .setTitle('Link Reported!')
          .setDescription('A link has been reported. Please try to fix this link ASAP or remove it from the dispenser.')
          .addFields(
            { name: 'Link', value: link, inline: false },
            { name: 'Error', value: error, inline: false }
          )
          .setFooter({
          text: footertext,
          iconURL: user.displayAvatarURL(),
        });
      
        const channelreport = await interaction.client.channels.fetch(config.report.report_channel_id);
        channelreport.send({ embeds: [reportEmbed] });
    } catch (error) {
        interaction.reply({ content: 'An error has occurred.', ephemeral: true });
    }
  },
};
