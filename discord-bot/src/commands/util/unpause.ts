import {ChatInputCommandInteraction, MessageFlags, SlashCommandBuilder} from 'discord.js';
import {InteractionDeps} from "../../utils/deps";
import {eq} from "drizzle-orm";
import {sharesTable, usersTable} from "../../db/schema";

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unpause')
        .setDescription('Unpause user shockers'),
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

        if(!dbUser.shares[0].paused){
            return await interaction.reply(
                {content:'Your shockers are already unpaused', flags: MessageFlags.Ephemeral}
            )
        }

        await dependencies.database.update(sharesTable)
            .set({paused: false})
            .where(eq(sharesTable.userId, dbUser.id));


        await interaction.reply({content: 'Unpaused your shockers', flags: MessageFlags.Ephemeral});
    },
};