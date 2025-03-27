import {ChatInputCommandInteraction, EmbedBuilder, GuildMember, RestOrArray, APIEmbedField, SlashCommandBuilder} from 'discord.js';
import {InteractionDeps} from "../../utils/deps";
import {eq} from "drizzle-orm";
import {usersTable} from "../../db/schema";

module.exports = {
    data: new SlashCommandBuilder()
        .setName('list')
        .setDescription('List users setup or shockers')
        .addMentionableOption(option =>
            option.setName('user')
                .setDescription('The User to shock').setRequired(true)),
    async execute(dependencies: InteractionDeps, interaction: ChatInputCommandInteraction) {
        const member: GuildMember = interaction.options.getMentionable('user') as GuildMember;

        const user = (await dependencies.database.query.usersTable.findFirst({
            where: eq(usersTable.userId, member.user.id),
            with: {
                shockers: true,
            }
        }))!

        const shockers = user.shockers.map((shocker) => {
            return {
                name: `Name: ${shocker.name}`, value: `ID: ${shocker.shockerId}`
            }
        })

        if(shockers.length === 0){
            return await interaction.reply('No shockers found for this user')
        }


        const listEmbed = new EmbedBuilder()
            .setColor(0x0099FF)
            .setTitle(`Shockers for ${member.user.globalName}`)
            .addFields(...shockers as RestOrArray<APIEmbedField>)


        await interaction.reply({embeds: [listEmbed]});
    },
};