import {ChatInputCommandInteraction, SlashCommandBuilder} from 'discord.js';
import {InteractionDeps} from "../../utils/deps";

module.exports = {
    data: new SlashCommandBuilder()
        .setName('sequence')
        .setDescription('Sequence command'),
    async execute(dependencies: InteractionDeps, interaction: ChatInputCommandInteraction) {
        await interaction.reply('Got sequence command');
    },
};