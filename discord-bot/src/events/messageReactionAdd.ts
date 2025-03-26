import {EmbedBuilder, Events, MessageFlags} from 'discord.js';
import {InteractionDeps} from "../utils/deps";
import {guildsTable, usersTable} from "../db/schema";
import {and, eq} from "drizzle-orm";

module.exports = {
    name: Events.MessageReactionAdd,
    // @ts-ignore
    async execute(dependencies: InteractionDeps, reaction, user) {
        if (user.bot) return;
        if (reaction.partial) {
            try {
                await reaction.fetch();
            } catch (error) {
                console.error('Something went wrong when fetching the message:', error);
                return;
            }
        }

        const guildId = reaction.message.guild.id;
        const messageId = reaction.message.id;

        const existingGuild = await dependencies
            .database.select()
            .from(guildsTable)
            .where(
                and(
                    eq(guildsTable.guildId, guildId),
                    eq(guildsTable.setupMessageId, messageId)
                )
            ).limit(1)
        if (existingGuild.length === 1) {
            if (reaction.emoji.name === '✅') {
                const setupEmbed = new EmbedBuilder()
                    .setColor(0x0099FF)
                    .setTitle('ShockBot Setup')
                    .setURL('https://github.com/juni-b-queer/discord-shock-bot')
                    .setDescription('Please go to this link and follow the instructions, the page will give you a blob of text to paste here.')
                    .setTimestamp()

                await user.send({embeds: [setupEmbed]})

                const guildDbValue = existingGuild[0]

                const userValues: typeof usersTable.$inferInsert = {
                    userId: user.id,
                    guildId: guildDbValue.id,
                    username: user.username,
                    globalName: user.globalName
                }

                await dependencies.database.insert(usersTable).values(userValues)
            }
        }
    },
};