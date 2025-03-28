import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js'
import { InteractionDeps } from '../../utils/deps'

export const data = new SlashCommandBuilder()
    .setName('ping')
    .setDescription('ping')

export async function execute(
    dependencies: InteractionDeps,
    interaction: ChatInputCommandInteraction
) {
    await interaction.reply('pong')
}
