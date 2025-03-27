import {ChatInputCommandInteraction, MessageFlags, SlashCommandBuilder} from 'discord.js';
import {InteractionDeps} from "../../utils/deps";
import {eq} from "drizzle-orm";
import {usersTable} from "../../db/schema";
import {debugLog} from "../../utils/debug";

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unpause')
        .setDescription('Unpause user shockers'),
    async execute(dependencies: InteractionDeps, interaction: ChatInputCommandInteraction) {
        const guildUser = interaction.user.id;
        const toggledPause = await dependencies.dbClient.toggleUserPaused(guildUser, false)

        // console.log(`Unpaused ${interaction.user.username}`)
        // const dbUser = await dependencies.database.query.usersTable.findFirst({
        //     where: eq(usersTable.userId, guildUser),
        // })
        //
        // if(!dbUser) {
        //     return await interaction.reply(
        //         {content: 'You are not registered. Please register by reacting to the setup message', flags: MessageFlags.Ephemeral}
        //     )
        // }
        //
        // if(!dbUser.paused){
        //     return await interaction.reply(
        //         {content:'Your shockers are already unpaused', flags: MessageFlags.Ephemeral}
        //     )
        // }
        //
        // await dependencies.database.update(usersTable)
        //     .set({paused: false})
        //     .where(eq(usersTable.id, dbUser.id));

        if(!toggledPause){
            return await interaction.reply({content: 'Failed to unpause shockers.', flags: MessageFlags.Ephemeral})
        }
        debugLog("INFO", "unpause", `Unpaused ${interaction.user.username}`)

        await interaction.reply({content: 'Unpaused your shockers', flags: MessageFlags.Ephemeral});


    },
};