import {
    AutocompleteInteraction,
    ChatInputCommandInteraction,
    CommandInteraction,
    SlashCommandBuilder
} from 'discord.js';
import {InteractionDeps} from "../../utils/deps";
import {shockersTable, usersTable} from "../../db/schema";
import {eq} from "drizzle-orm";
import {shockerAutocomplete} from "../../utils/autocomplete";

module.exports = {
    data: new SlashCommandBuilder()
        .setName('shock')
        .setDescription('Shock user')
        .addMentionableOption(option =>
            option.setName('user')
                .setDescription('The User to shock').setRequired(true))
        .addNumberOption(option =>
            option.setName('intensity')
                .setDescription('The shock intensity').setRequired(true))
        .addNumberOption(option =>
            option.setName('duration')
                .setDescription('The shock duration in milliseconds').setRequired(true))
        .addStringOption(option =>
            option.setName('shocker')
                .setDescription('The name of the users shocker')
                .setAutocomplete(true)),
    async execute(dependencies: InteractionDeps, interaction: ChatInputCommandInteraction) {
        console.log(interaction.options)

        // Todo run openshock api call
        await interaction.reply('Got shock command');
    },
    async autocomplete(dependencies: InteractionDeps, interaction: AutocompleteInteraction){
        await shockerAutocomplete(dependencies, interaction)
    }
};