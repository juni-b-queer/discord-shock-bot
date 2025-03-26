import {
    AutocompleteInteraction,
    ChatInputCommandInteraction,
    CommandInteraction, GuildMember,
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



        console.log(interaction.options)

        // Todo run openshock api call
        await interaction.reply('Got shock command');
    },
    async autocomplete(dependencies: InteractionDeps, interaction: AutocompleteInteraction){
        await shockerAutocomplete(dependencies, interaction)
    }
};