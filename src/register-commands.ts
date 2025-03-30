import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const clientId = process.env.DISCORD_CLIENT_ID!;
const guildId = process.env.DISCORD_GUILD_ID!;
const token = process.env.DISCORD_TOKEN!;

const commandsPath = path.resolve(__dirname, './commands');
const commands: any[] = [];

fs.readdirSync(commandsPath).forEach(folderOrFile => {
  const fullPath = path.join(commandsPath, folderOrFile);

  if (fs.statSync(fullPath).isDirectory()) {
    const commandFiles = fs.readdirSync(fullPath).filter(file => file.endsWith('.js'));

    commandFiles.forEach(file => {
      const command = require(path.join(fullPath, file));
      if (command.data && command.execute) {
        commands.push(command.data.toJSON());
      } else {
        console.error(`Command in ${fullPath}/${file} is missing 'data' or 'execute' function.`);
      }
    });
  } else if (folderOrFile.endsWith('.js')) {
    const command = require(path.join(commandsPath, folderOrFile));
    if (command.data && command.execute) {
      commands.push(command.data.toJSON());
    } else {
      console.error(`Command ${folderOrFile} is missing 'data' or 'execute' function.`);
    }
  }
});

const rest = new REST({ version: '10' }).setToken(token);

(async () => {
  try {
    console.log('Started refreshing application (/) commands.');
    await rest.put(
      Routes.applicationGuildCommands(clientId, guildId), 
      { body: commands },
    );
    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error('Error registering commands:', error);
  }
})();