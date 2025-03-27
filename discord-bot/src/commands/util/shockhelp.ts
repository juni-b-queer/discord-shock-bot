import {
    ChatInputCommandInteraction,
    EmbedBuilder,
    GuildMember,
    RestOrArray,
    APIEmbedField,
    SlashCommandBuilder
} from 'discord.js';
import {InteractionDeps} from "../../utils/deps";
import {eq} from "drizzle-orm";
import {usersTable} from "../../db/schema";
import {debugLog} from "../../utils/debug";

module.exports = {
    data: new SlashCommandBuilder()
        .setName('shockhelp')
        .setDescription('Provides info on how to use the commands for this bot'),
    async execute(dependencies: InteractionDeps, interaction: ChatInputCommandInteraction) {
        const commands = [
            {
                name: '/shock {user} {intensity} {duration} {shocker?}',
                value: 'Shock a user. If no shocker is specified, all shockers will be used'
            },
            {
                name: '/vibrate {user} {intensity} {duration} {shocker?}',
                value: 'Vibrate a users shocker. If no shocker is specified, all shockers will be used'
            },
            {
                name: '/repeat {user} {sequence} {repetitions} {shocker?}',
                value: '**WIP** Not yet implemented'
            },
            {
                name: '/sequence {user} {sequence} {shocker?}',
                value: '**WIP** Not yet implemented'
            },
            {
                name: '/list {user?}',
                value: 'If no user is provided, list all users with shockers setup in the server. If a user is provided, list all shockers for that user'
            },
            {
                name: '/pause',
                value: 'Pause control of your shockers. Users will not be able to shock you until you unpause'
            },
            {
                name: '/unpause',
                value: 'Unpause control of your shockers.'
            },
            {
                name: '/shockhelp',
                value: 'Show this message :)'
            },
        ]

        const listEmbed = new EmbedBuilder()
            .setColor(0x0099FF)
            .setTitle(`Shock commands help`)
            .setDescription('Brief explanation of the commands\n\n')
            .setFields(...commands as RestOrArray<APIEmbedField>)

        debugLog("INFO", "list-user", "Listed user shockers")

        await interaction.reply({embeds: [listEmbed]});

    },
};