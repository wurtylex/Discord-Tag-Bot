const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Events, GatewayIntentBits } = require('discord.js');
const { token } = require('../config.json');
const { Tags } = require('./database.js');
const tree = require('./RBmaintainer.js');
const cron = require('node-cron');
const { tagger } = require('../roles.json');

const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildMembers,
	],
});

client.commands = new Collection();
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		if ('data' in command && 'execute' in command) {
			client.commands.set(command.data.name, command);
		} else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}

client.once(Events.ClientReady, async readyClient => {
	//await Tags.sync({ force: true });
	await Tags.sync();
	await tree.initialize();

	cron.schedule('0 12 * * *', async () => {
        const role = readyClient.guilds.cache.first().roles.cache.find(role => role.name === tagger);

        if (!role) {
            console.log('Role not found.');
            return;
        }

        const members = await readyClient.guilds.cache.first().members.fetch();
        const membersWithoutRole = members.filter(member => !member.roles.cache.has(role.id));

        for (const member of membersWithoutRole.values()) {
            const tag = await Tags.findOne({ where: { id: member.id } });
            if (tag) {
                tag.gold += 1;
                await tag.save();
            }
        }
    });

	console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;
	const command = interaction.client.commands.get(interaction.commandName);

	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
		return;
	}

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
		} else {
			await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
		}
	}
});

client.login(token);