import {
    ChatInputCommandInteraction,
    EmbedBuilder,
    GuildMember,
    RestOrArray,
    APIEmbedField,
    SlashCommandBuilder,
    MessageFlags
} from 'discord.js';
import {InteractionDeps} from "../../utils/deps";
import {eq} from "drizzle-orm";
import {usersTable} from "../../db/schema";
import {debugLog} from "../../utils/debug";

module.exports = {
    data: new SlashCommandBuilder()
        .setName('list')
        .setDescription('List shockable users, or shockers for a user')
        .addMentionableOption(option =>
            option.setName('user')
                .setDescription('The User to get their shockers')),
    async execute(dependencies: InteractionDeps, interaction: ChatInputCommandInteraction) {
        if(interaction.options.getMentionable('user') === null){
            const dbGuild = await dependencies.dbClient.getUsersFromGuild(interaction.guildId!)
            if(!dbGuild){
                return await interaction.reply({content: 'Guild has not been setup', flags: MessageFlags.Ephemeral})
            }
            if(dbGuild.users.length === 0){
                return await interaction.reply({content:'No users registered in this server', flags: MessageFlags.Ephemeral})
            }

            await interaction.deferReply()
            const listUsers = dbGuild.users.map((user) => {
                const shockers = user.shockers.map((shocker) => {
                    return shocker.name + (shocker.default ? ' (default)' : '')
                }).join(', ')
                return {
                    name: `Name: ${user.globalName}${user.paused ? ' (paused)' : ''}`, value: `Intensity Limit: ${user.intensityLimit}\nShockers: ${shockers}`
                }
            })

            const listEmbed = new EmbedBuilder()
                .setColor(0x0099FF)
                .setTitle(`Shockable Users`)
                .addFields(...listUsers as RestOrArray<APIEmbedField>)

            debugLog("INFO", "list-Guild", "Listed guild users")


            await interaction.followUp({embeds: [listEmbed]});

        }else{
            const user = await dependencies.dbClient.getUserFromInteractionOptions(interaction)

            if(!user){
                return await interaction.reply({content: 'User not registered.', flags: MessageFlags.Ephemeral})
            }

            const shockers = user.shockers.map((shocker) => {
                return shocker.name + (shocker.default ? ' (default)' : '')
            })

            if(shockers.length === 0){
                return await interaction.reply({content: 'No shockers found for this user', flags: MessageFlags.Ephemeral})
            }

            const listEmbed = new EmbedBuilder()
                .setColor(0x0099FF)
                .setTitle(`Shockers for ${user.globalName}:`)
                .setDescription(`${shockers.join(', ')}\n\nIntensity Limit: ${user.intensityLimit}`)

            debugLog("INFO", "list-user", "Listed user shockers")

            await interaction.reply({embeds: [listEmbed]});
        }


    },
};