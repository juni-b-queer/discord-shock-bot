import {AutocompleteInteraction, ChatInputCommandInteraction, GuildMember, SlashCommandBuilder} from 'discord.js';
import {InteractionDeps} from "../../utils/deps";
import {eq} from "drizzle-orm";
import {usersTable} from "../../db/schema";
import {shockerAutocomplete} from "../../utils/autocomplete";

module.exports = {
    data: new SlashCommandBuilder()
        .setName('sequence')
        .setDescription('Sequence command')
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
        const member: GuildMember = interaction.options.getMentionable('user') as GuildMember;
        const user = (await dependencies.database.query.usersTable.findFirst({
            where: eq(usersTable.userId, member.user.id),
            with: {
                shockers: true
            }
        }))
        if(!user){
            return await interaction.reply('User not registered.')
        }
        if(user.paused){
            return await interaction.reply('This user has paused their shockers')
        }
        // TODO

        // parse sequence
        await interaction.reply('**TODO** Got sequence command');
    },
    async autocomplete(dependencies: InteractionDeps, interaction: AutocompleteInteraction){
        await shockerAutocomplete(dependencies, interaction)
    }
};