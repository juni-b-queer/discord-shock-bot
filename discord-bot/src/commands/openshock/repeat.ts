import {AutocompleteInteraction, ChatInputCommandInteraction, SlashCommandBuilder} from 'discord.js';
import {InteractionDeps} from "../../utils/deps";
import {shockerAutocomplete} from "../../utils/autocomplete";

module.exports = {
    data: new SlashCommandBuilder()
        .setName('repeat')
        .setDescription('Repeat shocks')
        .addMentionableOption(option =>
            option.setName('user')
                .setDescription('The User to shock').setRequired(true))
        .addStringOption(option =>
            option.setName('sequencestring')
                .setDescription('The sequence string').setRequired(true))
        .addNumberOption(option =>
            option.setName('repetitions')
                .setDescription('The number of times to repeat the sequence').setRequired(true))
        .addStringOption(option =>
            option.setName('shocker')
                .setDescription('The name of the users shocker')
                .setAutocomplete(true)),
    async execute(dependencies: InteractionDeps, interaction: ChatInputCommandInteraction) {
        await interaction.reply('Got repeat command');
    },
    async autocomplete(dependencies: InteractionDeps, interaction: AutocompleteInteraction) {
        await shockerAutocomplete(dependencies, interaction)
    }
};