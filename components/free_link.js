const {EmbedBuilder } = require('discord.js');
const { Link } = require('../models/linkSchema');
const config = require('../config.json');

const cooldowns = new Map();

module.exports = {
  data: {
    customId: 'free_link',
  },
  async execute(interaction) {
    try {
      const userId = interaction.user.id;

      const cooldownKey = `free_cooldown_${userId}`;

      if (cooldowns.has(cooldownKey)) {
        const lastCooldownTime = cooldowns.get(cooldownKey);
        const currentTime = Date.now();
        const cooldownTime = config.links.free_cooldown_hours * 60 * 60 * 1000;

        if (currentTime - lastCooldownTime < cooldownTime) {
          const remainingCooldown = cooldownTime - (currentTime - lastCooldownTime);
          interaction.reply({ content: `You're on cooldown! Please wait ` + '`' + `${formatTime(remainingCooldown)}` + '`' + ` before requesting another link.`, ephemeral: true });
          return;
        }
      }

      const freeLink = await Link.findOne({ type: 'Free', userHistory: { $ne: userId } });

      if (freeLink) {
        freeLink.userHistory.push(userId);
        await freeLink.save();
        cooldowns.set(cooldownKey, Date.now());

        let displayLink = freeLink.url.replace(/\s+/g, ''); 

        if (!displayLink.includes('https')) {
          displayLink = 'https://' + displayLink; 
        }
        
        const userDM = await interaction.user.createDM();
        const embed = new EmbedBuilder()
          .setTitle(config.embed.title)
          .setColor(config.embed.color)
          .addFields(
            { name: 'Accessed Domain', value: "```" + `${displayLink}` + "```" },
            { name: 'Cooldown', value: "```" + `${config.links.free_cooldown_hours}h` + "```"}
          )
          .setFooter({text: config.embed.footer.text, iconURL: config.embed.footer.iconURL});

        const message = await userDM.send({ embeds: [embed] });

        interaction.reply({ content: `Free link dispensed! Make sure your DMs are open to receive the link. [[Jump to Message]](${message.url})`, ephemeral: true });
        const logchannel = interaction.client.guilds.cache
          .map(guild => guild.channels.cache.get(config.links.log_channel))
          .find(channel => channel);
        const logembed = new EmbedBuilder()
        .setTitle("Domain Dispensed!")
        .setAuthor({ name: `${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL() })
        .setColor(config.embed.color)
        .addFields(
          { name: 'Link', value: "```" + `${displayLink}`+ "```" },
          { name: 'Type', value: "```Free```"}
        )
        logchannel.send({embeds: [logembed]})
      } else {
        interaction.reply({ content: 'No more free links available for you.', ephemeral: true });
      }
    } catch (error) {
      console.error(`Error dispensing free link: ${error}`);
      interaction.reply({ content: 'Error dispensing free link.', ephemeral: true });
    }
  },
};

function formatTime(milliseconds) {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
}
