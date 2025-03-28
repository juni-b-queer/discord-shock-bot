import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { InteractionDeps } from '../../utils/deps';

module.exports = {
    data: new SlashCommandBuilder().setName('ping').setDescription('ping'),
    async execute(
        dependencies: InteractionDeps,
        interaction: ChatInputCommandInteraction
    ) {
        await interaction.reply('pong');
    },
};
