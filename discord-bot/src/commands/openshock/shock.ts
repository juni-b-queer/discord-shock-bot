import {ChatInputCommandInteraction, SlashCommandBuilder} from 'discord.js';
import {InteractionDeps} from "../../utils/deps";

module.exports = {
    data: new SlashCommandBuilder()
        .setName('shock')
        .setDescription('Shock user'),
    async execute(dependencies: InteractionDeps, interaction: ChatInputCommandInteraction) {
        await interaction.reply('Got shock command');
    },
};