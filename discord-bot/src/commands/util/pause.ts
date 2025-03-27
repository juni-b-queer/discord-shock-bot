import {ChatInputCommandInteraction, MessageFlags, SlashCommandBuilder} from 'discord.js';
import {InteractionDeps} from "../../utils/deps";
import {usersTable} from "../../db/schema";
import {eq} from "drizzle-orm";

module.exports = {
    data: new SlashCommandBuilder()
        .setName('pause')
        .setDescription('Pause Shockers'),
    async execute(dependencies: InteractionDeps, interaction: ChatInputCommandInteraction) {
        const guildUser = interaction.user.id;
        console.log(`Paused ${interaction.user.username}`)
        const dbUser = await dependencies.database.query.usersTable.findFirst({
            where: eq(usersTable.userId, guildUser),
        })

        if(!dbUser) {
            return await interaction.reply(
                {content: 'You are not registered. Please register by reacting to the setup message', flags: MessageFlags.Ephemeral}
            )
        }

        if(dbUser.paused){
            return await interaction.reply(
                {content:'Your shockers are already paused', flags: MessageFlags.Ephemeral}
            )
        }

        await dependencies.database.update(usersTable)
            .set({paused: true})
            .where(eq(usersTable.id, dbUser.id));


        await interaction.reply({content: 'Paused your shockers', flags: MessageFlags.Ephemeral});
    },
};