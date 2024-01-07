const { Client, GatewayIntentBits, REST, ActivityType } = require('discord.js');
const { Routes } = require('discord-api-types/v10');
const { readdirSync, readFileSync } = require('fs');
const mongoose = require('mongoose');
const config = require('./config.json');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { Link } = require('./models/linkSchema');

const pink = '\x1b[95m';
const green = '\x1b[92m';
const blue = '\x1b[34m';
const gray = '\x1b[90m';
const red = '\x1b[91m';
const reset = '\x1b[0m';

mongoose.connect(config.db.uri, {
  dbName: 'Dispenser',
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, `${red}(-) MongoDB connection error:${reset}`));
db.once('open', async () => {
  console.log(`${pink}(-) Connected to MongoDB!${reset}`);

  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
      GatewayIntentBits.GuildMembers,
    ],
  });

  const token = config.bot.token;
  const clientId = config.bot.client_id;
  const guild_id = config.bot.guild_id;

  const commands = [];

  client.once('ready', async () => {
    console.log(`${green}(+) Logged in as ${client.user.tag}${reset}`);

    try {
      client.user.setPresence({
        activities: [{ name: 'Links', type: ActivityType.Streaming, url: 'https://twitch.tv/discord' }],
        status: 'online',
      });
      const guild = await client.guilds.fetch(guild_id);

      const commandFiles = readdirSync('./commands').filter(file => file.endsWith('.js'));

      for (const file of commandFiles) {
        try {
          const command = require(`./commands/${file}`);
          if (command.data instanceof SlashCommandBuilder) {
            commands.push(command.data.toJSON());
          }
        } catch (error) {
          console.error(`${red}(+) Error loading ${file}:${reset}`, error);
        }
      }

      const rest = new REST({ version: '10' }).setToken(token);

      console.log(`${green}(+) Started refreshing application (/) commands.${reset}`);

      await rest.put(
        Routes.applicationGuildCommands(clientId, guild_id),
        { body: [...commands] },
      );

      console.log(`${green}(+) Successfully reloaded application (/) commands.${reset}`);
      console.log(`${green}(+) Number Slash Commands Registered: ${commands.length}${reset}`);

      const freeLinks = readFileSync('./links/free.txt', 'utf-8').split('\n');
      const premiumLinks = readFileSync('./links/premium.txt', 'utf-8').split('\n');

      console.log(`${blue}($) Reading Free Links!${reset}`);
      addLinks(freeLinks, 'Free');

      console.log(`${blue}($) Reading Premium Links!${reset}`);
      addLinks(premiumLinks, 'Premium');
    } catch (error) {
      console.error(`${red}(+) Error during initialization:${reset}`, error);
    }
  });

  client.on('interactionCreate', async (interaction) => {
    if (!interaction.isCommand() && !interaction.isButton() && !interaction.isStringSelectMenu() && !interaction.isMessageComponent() &&!interaction.isModalSubmit()) return;

  
    try {
      if (interaction.isCommand()) {
        const commandFile = `./commands/${interaction.commandName}.js`;
        const command = require(commandFile);
        command.execute(interaction);
      } else {
        const componentFile = `./components/${interaction.customId}.js`; 
        const componentData = require(componentFile);
        componentData.execute(interaction);
      }
    } catch (error) {
      console.error(`${red}(+) Error during interaction handling:${reset}`, error);
      interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
    }
  });
  

  client.login(token);
});

async function addLinks(links, type) {
  try {
    const uniqueLinks = Array.from(new Set(links));

    if (!mongoose.models.Link) {
      const linkObjects = uniqueLinks.map(url => ({ url, type }));
      await Link.insertMany(linkObjects);
      console.log(`${blue}($) Added ${uniqueLinks.length} unique ${type} Links to the Database!${reset}`);
      return;
    }

    const existingLinks = await Link.find({ url: { $in: uniqueLinks } });
    const existingLinkUrls = existingLinks.map(link => link.url);

    const newLinks = uniqueLinks.filter(url => !existingLinkUrls.includes(url));

    if (newLinks.length > 0) {
      const linkObjects = newLinks.map(url => ({ url, type }));
      await Link.insertMany(linkObjects);
      console.log(`${blue}($) Added ${newLinks.length} new unique ${type} Links to the Database!${reset}`);
    } else {
      console.log(`${gray}($) No new unique ${type} Links to add.${reset}`);
    }
  } catch (error) {
    console.error(`${red}(-) Error adding links to the database: ${error}${reset}`);
  }
}
