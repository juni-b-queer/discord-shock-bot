import {ChatInputCommandInteraction, SlashCommandBuilder} from 'discord.js';
import {InteractionDeps} from "../../utils/deps";

module.exports = {
    data: new SlashCommandBuilder()
        .setName('pause')
        .setDescription('Pause Shockers'),
    async execute(dependencies: InteractionDeps, interaction: ChatInputCommandInteraction) {
        await interaction.reply('Got pause command');
    },
};