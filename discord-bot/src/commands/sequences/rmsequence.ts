import {
    AutocompleteInteraction,
    ChatInputCommandInteraction,
    MessageFlags,
    SlashCommandBuilder,
} from 'discord.js'
import { InteractionDeps } from '../../utils/deps'
import { eq } from 'drizzle-orm'
import { sequencesTable } from '../../db/schema'

export const data = new SlashCommandBuilder()
    .setName('rmsequence')
    .setDescription('Delete a saved sequence')
    .addStringOption((option) =>
        option
            .setName('name')
            .setDescription('Name of the sequence')
            .setAutocomplete(true)
            .setRequired(true)
    )

export async function execute(
    dependencies: InteractionDeps,
    interaction: ChatInputCommandInteraction
) {
    const name = interaction.options.getString('name')!
    const userId = interaction.user.id

    const user = await dependencies.dbClient.getUser(userId)
    let sequence = user?.sequences.find((sequence) => sequence.name === name)

    if (!sequence) {
        return await interaction.reply({
            content: 'Sequence not found, or not created by you',
            flags: MessageFlags.Ephemeral,
        })
    }

    await dependencies.database
        .delete(sequencesTable)
        .where(eq(sequencesTable.id, sequence.id))

    await interaction.reply({
        content: `Sequence ${name} deleted`,
        flags: MessageFlags.Ephemeral,
    })
}

export async function autocomplete(
    dependencies: InteractionDeps,
    interaction: AutocompleteInteraction
) {
    const user = await dependencies.dbClient.getUser(interaction.user.id!)

    if (!user) {
        await interaction.respond([])
    }

    const focusedValue = interaction.options.getFocused()
    const filtered = user!.sequences.filter((choice) =>
        choice.name.includes(focusedValue)
    )
    await interaction.respond(
        filtered.map((choice) => ({
            name: `${choice.name} (${choice.sequence})`,
            value: choice.name,
        }))
    )
}
