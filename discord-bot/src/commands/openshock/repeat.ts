import {AutocompleteInteraction, ChatInputCommandInteraction, GuildMember, SlashCommandBuilder} from 'discord.js';
import {InteractionDeps} from "../../utils/deps";
import {shockerAutocomplete} from "../../utils/autocomplete";
import {eq} from "drizzle-orm";
import {usersTable} from "../../db/schema";

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
                .setDescription('The number of times to repeat the sequence')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('shocker')
                .setDescription('The name of the users shocker')
                .setAutocomplete(true)),
    async execute(dependencies: InteractionDeps, interaction: ChatInputCommandInteraction) {
        const member: GuildMember = interaction.options.getMentionable('user') as GuildMember;
        const user = (await dependencies.database.query.usersTable.findFirst({
            where: eq(usersTable.userId, member.user.id),
            with: {
                shockers: true,
                shares: true
            }
        }))
        if(!user){
            return await interaction.reply('User not registered.')
        }
        if(user.shares[0].paused){
            return await interaction.reply('This user has paused their shockers')
        }

        // Parse sequence
        await interaction.reply('Got repeat command');
    },
    async autocomplete(dependencies: InteractionDeps, interaction: AutocompleteInteraction) {
        await shockerAutocomplete(dependencies, interaction)
    }
};