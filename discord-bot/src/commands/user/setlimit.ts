import {
    ChatInputCommandInteraction,
    MessageFlags,
    SlashCommandBuilder,
} from 'discord.js';
import { InteractionDeps } from '../../utils/deps';
import { debugLog } from '../../utils/debug';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setlimit')
        .setDescription('Set Intensity Limit for your shockers')
        .addNumberOption((option) =>
            option
                .setName('limit')
                .setDescription('The shock intensity limit (1-100)')
                .setRequired(true)
        ),
    async execute(
        dependencies: InteractionDeps,
        interaction: ChatInputCommandInteraction
    ) {
        const limit = interaction.options.getNumber('limit')!;
        if (limit < 1 || limit > 100) {
            return await interaction.reply({
                content: 'Limit must be between 1 and 100',
                flags: MessageFlags.Ephemeral,
            });
        }
        const guildUser = interaction.user.id;
        const editLimit = await dependencies.dbClient.editUserIntensityLimit(
            guildUser,
            limit
        );

        if (!editLimit) {
            return await interaction.reply({
                content: 'Failed to update limit.',
                flags: MessageFlags.Ephemeral,
            });
        }

        debugLog(
            'INFO',
            'setLimit',
            `Changed limit to ${limit} for ${interaction.user.username}`
        );
        await interaction.reply({
            content: `Set your limit to ${limit}`,
            flags: MessageFlags.Ephemeral,
        });
    },
};
