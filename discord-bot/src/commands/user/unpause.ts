import {
    ChatInputCommandInteraction,
    MessageFlags,
    SlashCommandBuilder,
} from 'discord.js'
import { InteractionDeps } from '../../utils/deps'
import { debugLog } from '../../utils/debug'

export const data = new SlashCommandBuilder()
    .setName('unpause')
    .setDescription('Unpause user shockers')

export async function execute(
    dependencies: InteractionDeps,
    interaction: ChatInputCommandInteraction
) {
    const guildUser = interaction.user.id
    const toggledPause = await dependencies.dbClient.toggleUserPaused(
        guildUser,
        false
    )

    if (!toggledPause) {
        return await interaction.reply({
            content: 'Failed to unpause shockers.',
            flags: MessageFlags.Ephemeral,
        })
    }
    debugLog('INFO', 'unpause', `Unpaused ${interaction.user.username}`)

    await interaction.reply({
        content: 'Unpaused your shockers',
        flags: MessageFlags.Ephemeral,
    })
}
