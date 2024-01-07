const { EmbedBuilder } = require('discord.js');
const { Link } = require('../models/linkSchema');
const config = require('../config.json');

const cooldowns = new Map();

module.exports = {
  data: {
    customId: 'premium_link',
  },
  async execute(interaction) {
    try {
      const userId = interaction.user.id;
      const member = interaction.guild.members.cache.get(userId);
      const premiumRoleID = config.links.premium_link_id;

      if (!member.roles.cache.has(premiumRoleID)) {
        interaction.reply({ content: 'Only premium users can access these links.', ephemeral: true });
        return;
      }
      const cooldownKey = `premium_cooldown_${userId}`;

      if (cooldowns.has(cooldownKey)) {
        const lastCooldownTime = cooldowns.get(cooldownKey);
        const currentTime = Date.now();
        const cooldownTime = config.links.premium_cooldown_hours * 60 * 60 * 1000;

        if (currentTime - lastCooldownTime < cooldownTime) {
          const remainingCooldown = cooldownTime - (currentTime - lastCooldownTime);
          interaction.reply({ content: `You're on cooldown! Please wait ` + '`' + `${formatTime(remainingCooldown)}` + '`' + ` before requesting another link.`, ephemeral: true });
          return;
        }
      }

      const premiumLink = await Link.findOne({ type: 'Premium', userHistory: { $ne: userId } });

      if (premiumLink) {
        premiumLink.userHistory.push(userId);
        await premiumLink.save();

        cooldowns.set(cooldownKey, Date.now());

        const userDM = await interaction.user.createDM();
        const embed = new EmbedBuilder()
        .setTitle(config.embed.title)
        .setColor(config.embed.color)
        .addFields(
          { name: 'Accessed Domain', value: `https://${premiumLink.url}` },
          { name: 'Cooldown', value: `${config.links.free_cooldown_hours}h`}
        )
        .setFooter({text: config.embed.footer.text, iconURL: config.embed.footer.iconURL});

        const message = await userDM.send({ embeds: [embed] });

        interaction.reply({ content: `Premium link dispensed! Make sure your DMs are open to receive the link. [[Jump to Message]   ](${message.url})`, ephemeral: true });
      } else {
        interaction.reply({ content: 'No more premium links available for you.', ephemeral: true });
      }
    } catch (error) {
      console.error(`Error dispensing premium link: ${error}`);
      interaction.reply({ content: 'Error dispensing premium link.', ephemeral: true });
    }
  },
};

function formatTime(milliseconds) {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
}
