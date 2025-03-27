import {AutocompleteInteraction, ChatInputCommandInteraction, GuildMember, SlashCommandBuilder} from 'discord.js';
import {InteractionDeps} from "../../utils/deps";
import {eq} from "drizzle-orm";
import {usersTable} from "../../db/schema";
import {shockerAutocomplete} from "../../utils/autocomplete";
import {OpenshockControlSchema} from "../../openshockAPI/openshockClient";
import {sequenceParser} from "../../openshockAPI/controlUtils";

module.exports = {
    data: new SlashCommandBuilder()
        .setName('sequence')
        .setDescription('WIP - Sequence command')
        .addMentionableOption(option =>
            option.setName('user')
                .setDescription('The User to shock').setRequired(true))
        .addStringOption(option =>
            option.setName('sequencestring')
                .setDescription('The sequence string').setRequired(true))
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
        const sequenceString = interaction.options.getString('sequencestring')!

        const sequenceCommands: OpenshockControlSchema[] = sequenceParser(sequenceString);

        // parse sequence
        await interaction.reply('**TODO** Got sequence command');
    },
    async autocomplete(dependencies: InteractionDeps, interaction: AutocompleteInteraction){
        await shockerAutocomplete(dependencies, interaction)
    }
};