import {
    ChatInputCommandInteraction,
    MessageFlags,
    SlashCommandBuilder,
} from 'discord.js'
import { InteractionDeps } from '../../utils/deps'
import { debugLog } from '../../utils/debug.ts'

export const data = new SlashCommandBuilder()
    .setName('savesequence')
    .setDescription('Save a sequence to use later')
    .addStringOption((option) =>
        option
            .setName('name')
            .setDescription('Name of the sequence')
            .setRequired(true)
    )
    .addStringOption((option) =>
        option
            .setName('sequencestring')
            .setDescription(
                'The sequence string ({s,v}-{intensity}-{seconds} separated by commas)'
            )
            .setRequired(true)
    )

export async function execute(
    dependencies: InteractionDeps,
    interaction: ChatInputCommandInteraction
) {
    const sequenceString = interaction.options.getString('sequencestring')!
    const name = interaction.options.getString('name')!
    const guildId = interaction.guildId!
    const userId = interaction.user.id

    await dependencies.dbClient.saveSequence(
        sequenceString,
        name,
        userId,
        guildId
    )

    debugLog(
        'INFO',
        'savesequence',
        `Saved sequence ${sequenceString} as ${name} for user ${userId} in guild ${guildId}`
    )

    await interaction.reply({
        content: `Sequence ${sequenceString} saved as ${name}`,
        flags: MessageFlags.Ephemeral,
    })
}
