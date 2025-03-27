import {
    BaseGuildTextChannel,
    Channel,
    ChatInputCommandInteraction,
    Client,
    MessageFlags,
    SlashCommandBuilder
} from 'discord.js';
import {InteractionDeps} from "../../utils/deps";
import {guildsTable} from "../../db/schema";
import {eq} from "drizzle-orm";
import {debugLog} from "../../utils/debug";

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setup')
        .setDescription('Start setup flow'),
    async execute(dependencies: InteractionDeps, interaction: ChatInputCommandInteraction) {
        const userId= interaction.user.id;
        const guildOwner = (await dependencies.client.guilds.fetch(interaction.guildId!))!.ownerId;

        if(userId !== guildOwner){
            await interaction.reply({content:'You are not the guild owner', flags: MessageFlags.Ephemeral})
            return
        }

        // await interaction.deferReply();
        const channel: Channel = (await dependencies.client.channels.fetch(interaction.channelId))!;
        if (!channel) {
            await interaction.reply('No Channel');
        }
        if(channel.isSendable()){
            const guildId = interaction.guildId!
            debugLog("INFO", "setup", `Setup for guild ${guildId}`)
            const existingGuild = await dependencies.database
                .select().from(guildsTable)
                .where(eq(guildsTable.guildId, guildId))
            if(existingGuild.length > 0 ) {
                const setupMessage = await channel.messages.fetch(existingGuild[0].setupMessageId)
                setupMessage.reply(
                    'Setup has already been done for this guild. Please use the existing setup message')
                await interaction.reply('Error during setup')
                return
            }

            const sent = await channel.send('React to this message with :white_check_mark: to start your shockbot setup. You will get a DM from the bot with more instructions.')
            sent.react('✅')

            const guildValues: typeof guildsTable.$inferInsert = {
                guildId: guildId,
                setupMessageId: sent.id
            }

            await dependencies.database.insert(guildsTable).values(guildValues)
        }
        await interaction.reply({content: 'Setup is ready', flags: MessageFlags.Ephemeral})

    },
};