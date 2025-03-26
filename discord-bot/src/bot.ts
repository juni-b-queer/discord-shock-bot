import {Client, Collection, GatewayIntentBits, Partials} from 'discord.js';
import dotenv from 'dotenv';
import path from "path";
import fs from "fs";
import {InteractionDeps} from "./utils/deps";
import {db} from "./db";

interface ClientWithCommands extends Client {
    commands: Collection<string, any>
}

dotenv.config({path: path.join(__dirname, '../../.env')});

console.log('start')

const client: ClientWithCommands = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.DirectMessages
    ],
    partials: [Partials.Message, Partials.Channel, Partials.Reaction],
}) as ClientWithCommands;

client.commands = new Collection();
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.ts'));
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

console.log('commands')

const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.ts'));

const deps: InteractionDeps = {
    client,
    database: db

}

for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    const event = require(filePath);
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args));
    } else {
        client.on(event.name, (...args) => event.execute(deps, ...args));
    }
}

console.log('events')
client.login(process.env.DISCORD_TOKEN);
