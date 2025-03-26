import {ChatInputCommandInteraction, MessageFlags, SlashCommandBuilder} from 'discord.js';
import {InteractionDeps} from "../../utils/deps";
import {sharesTable, usersTable} from "../../db/schema";
import {eq} from "drizzle-orm";

module.exports = {
    data: new SlashCommandBuilder()
        .setName('pause')
        .setDescription('Pause Shockers'),
    async execute(dependencies: InteractionDeps, interaction: ChatInputCommandInteraction) {
        const guildUser = interaction.user.id;
        const dbUser = await dependencies.database.query.usersTable.findFirst({
            where: eq(usersTable.userId, guildUser),
            with:{
                shares: true
            }
        })

        if(!dbUser) {
            return await interaction.reply(
                {content: 'You are not registered. Please register by reacting to the setup message', flags: MessageFlags.Ephemeral}
            )
        }

        if(dbUser.shares[0].paused){
            return await interaction.reply(
                {content:'Your shockers are already paused', flags: MessageFlags.Ephemeral}
            )
        }

        await dependencies.database.update(sharesTable)
            .set({paused: true})
            .where(eq(sharesTable.userId, dbUser.id));


        await interaction.reply({content: 'Paused your shockers', flags: MessageFlags.Ephemeral});
    },
};