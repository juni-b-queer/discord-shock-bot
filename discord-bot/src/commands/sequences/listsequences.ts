import {
    ChatInputCommandInteraction,
    EmbedBuilder,
    MessageFlags,
    SlashCommandBuilder,
} from 'discord.js'
import { InteractionDeps } from '../../utils/deps'

export const data = new SlashCommandBuilder()
    .setName('listsequences')
    .setDescription('Retrieve sequences')

export async function execute(
    dependencies: InteractionDeps,
    interaction: ChatInputCommandInteraction
) {
    const guildId = interaction.guildId!
    const userId = interaction.user.id

    const guild = await dependencies.dbClient.getGuild(guildId)
    const user = await dependencies.dbClient.getUser(userId)

    if (!guild) {
        await interaction.reply({
            content: 'Server not found',
            flags: MessageFlags.Ephemeral,
        })
        return
    }
    let userSequences: any[]
    let guildSequences
    if (!user) {
        guildSequences = guild.sequences
        userSequences = []
    } else {
        userSequences = user.sequences
        guildSequences = guild.sequences.filter(
            (sequence) => sequence.userId !== user.id
        )
    }
    let fields = []
    if (userSequences.length > 0) {
        fields.push({
            name: 'User Sequences',
            value: userSequences
                .map((sequence) => `${sequence.name}\n${sequence.sequence}`)
                .join('\n\n'),
        })
    }
    if (guildSequences.length > 0) {
        fields.push({
            name: 'Server Sequences',
            value: guildSequences
                .map((sequence) => `${sequence.name}\n${sequence.sequence}`)
                .join('\n\n'),
        })
    }
    if (fields.length === 0) {
        return await interaction.reply({
            content: 'No sequences found',
            flags: MessageFlags.Ephemeral,
        })
    }

    const sequenceEmbed = new EmbedBuilder()
        .setColor(0x0099ff)
        .setTitle(`List of sequences`)
        .setFields(...fields)

    await interaction.reply({ embeds: [sequenceEmbed] })
}
