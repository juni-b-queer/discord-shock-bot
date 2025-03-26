import {Client, Events, MessageFlags} from 'discord.js';
import {InteractionDeps} from "../utils/deps";

// @ts-ignore
async function handleAutocomplete(dependencies:InteractionDeps, interaction) {
    const command = interaction.client.commands.get(interaction.commandName);

    if (!command) {
        console.error(`No command matching ${interaction.commandName} was found.`);
        return;
    }

    try {
        await command.autocomplete(dependencies, interaction);
    } catch (error) {
        console.error(error);
    }
    return;
}

// @ts-ignore
async function handleCommand(dependencies:InteractionDeps, interaction) {
    const command = interaction.client.commands.get(interaction.commandName);

    if (!command) {
        console.error(`No command matching ${interaction.commandName} was found.`);
        return;
    }

    try {
        await command.execute(dependencies, interaction);
    } catch (error) {
        console.error(error);
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content: 'There was an error while executing this command!', flags: MessageFlags.Ephemeral });
        } else {
            await interaction.reply({ content: 'There was an error while executing this command!', flags: MessageFlags.Ephemeral });
        }
    }
}

module.exports = {
    name: Events.InteractionCreate,
    // @ts-ignore
    async execute(dependencies:InteractionDeps, interaction) {
        if(interaction.isAutocomplete()){
            await handleAutocomplete(dependencies, interaction)
            return;
        }

        if (interaction.isChatInputCommand()){
            await handleCommand(dependencies, interaction)
            return;
        }

        return;
    },
};