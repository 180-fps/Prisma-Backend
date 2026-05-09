const { Client, GatewayIntentBits, Collection, REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');
const config = require('../config.json');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages
  ]
});

client.commands = new Collection();

function loadCommands() {
  const commands = [];
  const foldersPath = path.join(__dirname, 'commands');
  
  if (!fs.existsSync(foldersPath)) {
    console.log('[Discord Bot] No commands folder found');
    return commands;
  }

  const commandFolders = fs.readdirSync(foldersPath);

  for (const folder of commandFolders) {
    const commandsPath = path.join(foldersPath, folder);
    
    if (!fs.statSync(commandsPath).isDirectory()) continue;

    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

    for (const file of commandFiles) {
      const filePath = path.join(commandsPath, file);
      const command = require(filePath);

      if ('data' in command && 'execute' in command) {
        client.commands.set(command.data.name, command);
        commands.push(command.data.toJSON());
        console.log(`[Discord Bot] Loaded command: ${command.data.name} (${folder})`);
      } else {
        console.log(`[Discord Bot] Warning: ${filePath} is missing required properties`);
      }
    }
  }

  return commands;
}

async function registerCommands() {
  try {
    const commands = loadCommands();

    if (commands.length === 0) {
      console.log('[Discord Bot] No commands to register');
      return;
    }

    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_BOT_TOKEN);

    console.log(`[Discord Bot] Registering ${commands.length} slash commands...`);

    const data = await rest.put(
      Routes.applicationCommands(process.env.DISCORD_CLIENT_ID),
      { body: commands }
    );

    console.log(`[Discord Bot] Successfully registered ${data.length} slash commands`);
  } catch (error) {
    console.error('[Discord Bot] Error registering commands:', error);
  }
}

client.once('ready', async () => {
  console.log(`[Discord Bot] Logged in as ${client.user.tag}`);
  client.user.setActivity(`Fortnite Chapter ${config.server.chapter} Season ${config.server.season}`, { type: 0 });
  
  await registerCommands();
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);

  if (!command) {
    console.error(`[Discord Bot] No command matching ${interaction.commandName} was found`);
    return;
  }

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(`[Discord Bot] Error executing ${interaction.commandName}:`, error);
    
    const errorMessage = {
      content: 'There was an error while executing this command.',
      ephemeral: true
    };

    if (interaction.replied || interaction.deferred) {
      await interaction.followUp(errorMessage);
    } else {
      await interaction.reply(errorMessage);
    }
  }
});

client.on('error', error => {
  console.error('[Discord Bot] Client error:', error);
});

function start() {
  if (!process.env.DISCORD_BOT_TOKEN) {
    console.log('[Discord Bot] No token provided, skipping Discord bot initialization');
    return;
  }

  if (!process.env.DISCORD_CLIENT_ID) {
    console.log('[Discord Bot] No client ID provided, skipping Discord bot initialization');
    return;
  }

  client.login(process.env.DISCORD_BOT_TOKEN).catch(err => {
    console.error('[Discord Bot] Failed to login:', err.message);
  });
}

module.exports = { start, client };
