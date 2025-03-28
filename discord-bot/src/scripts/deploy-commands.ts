import {REST, Routes} from 'discord.js';
import dotenv from 'dotenv';
import fs from 'node:fs';
import path from 'node:path';
import {db} from "../db";
import {guildsTable} from "../db/schema";



dotenv.config({path: path.join(__dirname, '../../../.env')});

const commands = [];
// Grab all the command folders from the commands directory you created earlier
const foldersPath = path.join(__dirname, '../commands');

const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
    // Grab all the command files from the commands directory you created earlier
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.ts'));
    // Grab the SlashCommandBuilder#toJSON() output of each command's data for deployment
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
        if ('data' in command && 'execute' in command) {
            commands.push(command.data.toJSON());
        } else {
            console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
        }
    }
}

// Construct and prepare an instance of the REST module
const rest = new REST().setToken(process.env.DISCORD_TOKEN ?? '');

// and deploy your commands!
(async () => {
    try {
        const guilds = await db.select().from(guildsTable)
        for (const guild of guilds) {
            console.log(`Started refreshing ${commands.length} application (/) commands for ${guild.guildId}.`);

            // The put method is used to fully refresh all commands in the guild with the current set
            const data = await rest.put(
                Routes.applicationGuildCommands(process.env.CLIENT_ID ?? '', guild.guildId),
                { body: commands },
            );

            // @ts-ignore
            console.log(`Successfully reloaded ${data.length} application (/) commands for ${guild.guildId}.`);
        }
        console.log('Done')
        return process.exit(0);

    } catch (error) {
        // And of course, make sure you catch and log any errors!
        console.error(error);
    }
})();