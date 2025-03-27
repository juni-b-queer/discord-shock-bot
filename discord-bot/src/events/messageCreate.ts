import {Client, Events, MessageFlags} from 'discord.js';
import {InteractionDeps} from "../utils/deps";
import {shockersTable, usersTable} from "../db/schema";
import {eq} from "drizzle-orm";
import {debugLog} from "../utils/debug";


module.exports = {
    name: Events.MessageCreate,
    // @ts-ignore
    async execute(dependencies: InteractionDeps, interaction) {
        if (interaction.author.bot) return;
        const userId = interaction.author.id;

        if (interaction.guildId === null) {
            const dbUser = await dependencies.database.query.usersTable.findFirst({
                where: eq(usersTable.userId, userId)
            })
            if (!dbUser) {
                interaction.author.send('You are not registered. Please register by reacting to the setup message')
            }
            // DM
            debugLog("INFO", "messageCreate", `Got a DM from ${interaction.author.username}`)
            const parsedData = JSON.parse(interaction.content)

            const shockers = parsedData.shockers

            const add = []
            const update = []
            const error = []


            for (const shocker of shockers) {
                const existingShocker = await dependencies.database.query.shockersTable.findFirst({
                    where: eq(shockersTable.shockerId, shocker.shockerId)
                })
                try {
                    if (existingShocker) {
                        await dependencies.database.update(shockersTable).set({
                            name: shocker.name,
                        }).where(eq(shockersTable.id, existingShocker.id))
                        update.push({id: shocker.id, name: shocker.name})
                    } else {
                        const shockerValues: typeof shockersTable.$inferInsert = {
                            userId: dbUser!.id,
                            shockerId: shocker.id,
                            name: shocker.name,
                        }

                        await dependencies.database.insert(shockersTable).values(shockerValues)
                        add.push({id: shocker.id, name: shocker.name})
                    }
                } catch (e) {
                    console.log(e)
                    error.push({id: shocker.id, name: shocker.name})
                }
            }

            let output = '';
            if (add.length > 0) {
                output += `Added ${add.length} shockers:\n`
                for (const shocker of add) {
                    output += `**${shocker.name}** (${shocker.id})\n`
                }
            }
            if (update.length > 0) {
                output += `Updated ${update.length} shockers:\n`
                for (const shocker of update) {
                    output += `**${shocker.name}** (${shocker.id})\n`
                }
            }
            if (error.length > 0) {
                output += `Failed to add ${error.length} shockers:\n`
                for (const shocker of error) {
                    output += `**${shocker.name}** (${shocker.id})\n`
                }
            }

            if (parsedData.apiToken !== null) {
                await dependencies.database.update(usersTable).set({apiKey: parsedData.apiToken}).where(eq(usersTable.id, dbUser!.id))
                output += '\nAPI token updated'
            }

            await interaction.author.send(output)

            return
        } else {
            const guildId = interaction.guildId
            // console.log(`Got message from user: ${interaction.author.username} in guild: ${guildId}`)
            return
        }
    },
};

