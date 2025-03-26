import {BaseGuildTextChannel, Channel, ChatInputCommandInteraction, Client, SlashCommandBuilder} from 'discord.js';
import {InteractionDeps} from "../../utils/deps";
import {guildsTable} from "../../db/schema";
import {int} from "drizzle-orm/mysql-core/index";
import {eq} from "drizzle-orm";

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setup')
        .setDescription('Start setup flow'),
    async execute(dependencies: InteractionDeps, interaction: ChatInputCommandInteraction) {
        await interaction.deferReply();
        const channel: Channel = (await dependencies.client.channels.fetch(interaction.channelId))!;
        if (!channel) {
            await interaction.followUp('No Channel');
        }
        if(channel.isSendable()){
            const guildId = interaction.guildId!
            const existingGuild = await dependencies.database
                .select().from(guildsTable)
                .where(eq(guildsTable.guildId, guildId))
            if(existingGuild.length > 0 ) {
                const setupMessage = await channel.messages.fetch(existingGuild[0].setupMessageId)
                setupMessage.reply(
                    'Setup has already been done for this guild. Please use the existing setup message')
                await interaction.followUp('Error during setup')
                return
            }

            const sent = await channel.send('React to this message with :white_check_mark: to start setup')
            sent.react('✅')

            const guildValues: typeof guildsTable.$inferInsert = {
                guildId: guildId,
                setupMessageId: sent.id
            }

            await dependencies.database.insert(guildsTable).values(guildValues)
        }
        await interaction.followUp('Setup is ready, please delete this message')

    },
};