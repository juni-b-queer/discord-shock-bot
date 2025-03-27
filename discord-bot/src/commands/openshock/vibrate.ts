import {AutocompleteInteraction, ChatInputCommandInteraction, GuildMember, SlashCommandBuilder} from 'discord.js';
import {InteractionDeps} from "../../utils/deps";
import {eq} from "drizzle-orm";
import {usersTable} from "../../db/schema";
import {shockerAutocomplete} from "../../utils/autocomplete";
import {OpenshockControlSchema} from "../../openshockAPI/openshockClient";
import {generateAndRunBasicControlRequests} from "../../openshockAPI/controlUtils";

module.exports = {
    data: new SlashCommandBuilder()
        .setName('vibrate')
        .setDescription('Send vibrate command')
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
        await generateAndRunBasicControlRequests(dependencies, interaction, "Vibrate")
    },
    async autocomplete(dependencies: InteractionDeps, interaction: AutocompleteInteraction){
        await shockerAutocomplete(dependencies, interaction)
    }
};