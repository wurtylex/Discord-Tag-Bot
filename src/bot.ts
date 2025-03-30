import { Client, GatewayIntentBits, Events } from 'discord.js';
const { syncServerState } = require('./utils/syncServerState');
import dotenv from 'dotenv';

dotenv.config();

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.on(Events.ClientReady, () => {
  console.log(`Logged in as ${client.user?.tag}!`);
});


client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isCommand()) return;

  const { commandName } = interaction;

  try {
    const command = require(`./commands/${commandName}.js`);

    if (command && command.execute) {
      await command.execute(interaction);
      const guild = interaction.guild;
      await syncServerState(guild);
    } else {
      console.error(`Can't execute '${commandName}' command: command or execute function is missing.`);
    }
  } catch (error) {
    console.error(`Error executing command '${commandName}':`, error);
  }
});

client.login(process.env.DISCORD_TOKEN);