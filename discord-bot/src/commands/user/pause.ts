import {
    ChatInputCommandInteraction,
    MessageFlags,
    SlashCommandBuilder,
} from 'discord.js';
import { InteractionDeps } from '../../utils/deps';
import { debugLog } from '../../utils/debug';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('pause')
        .setDescription('Pause Shockers'),
    async execute(
        dependencies: InteractionDeps,
        interaction: ChatInputCommandInteraction
    ) {
        const guildUser = interaction.user.id;
        const toggledPause = await dependencies.dbClient.toggleUserPaused(
            guildUser,
            true
        );

        if (!toggledPause) {
            return await interaction.reply({
                content: 'Failed to pause shockers.',
                flags: MessageFlags.Ephemeral,
            });
        }

        debugLog('INFO', 'pause', `Paused ${interaction.user.username}`);
        await interaction.reply({
            content: 'Paused your shockers',
            flags: MessageFlags.Ephemeral,
        });
    },
};
