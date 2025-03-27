import {AutocompleteInteraction, ChatInputCommandInteraction, GuildMember, SlashCommandBuilder} from 'discord.js';
import {InteractionDeps} from "../../utils/deps";
import {shockerAutocomplete} from "../../utils/autocomplete";
import {eq} from "drizzle-orm";
import {usersTable} from "../../db/schema";

module.exports = {
    data: new SlashCommandBuilder()
        .setName('repeat')
        .setDescription('WIP - Repeat shocks')
        .addMentionableOption(option =>
            option.setName('user')
                .setDescription('The User to shock').setRequired(true))
        .addStringOption(option =>
            option.setName('sequencestring')
                .setDescription('The sequence string').setRequired(true))
        .addNumberOption(option =>
            option.setName('repetitions')
                .setDescription('The number of times to repeat the sequence')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('shocker')
                .setDescription('The name of the users shocker')
                .setAutocomplete(true)),
    async execute(dependencies: InteractionDeps, interaction: ChatInputCommandInteraction) {
        const user = await dependencies.dbClient.getUserFromInteractionOptions(interaction)

        if(!user){
            return await interaction.reply('User not registered.')
        }
        if(user.paused){
            return await interaction.reply('This user has paused their shockers')
        }

        // TODO

        // Parse sequence
        await interaction.reply('**TODO** Got repeat command');
    },
    async autocomplete(dependencies: InteractionDeps, interaction: AutocompleteInteraction) {
        await shockerAutocomplete(dependencies, interaction)
    }
};