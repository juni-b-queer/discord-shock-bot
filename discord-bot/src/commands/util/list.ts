import {ChatInputCommandInteraction, SlashCommandBuilder} from 'discord.js';
import {InteractionDeps} from "../../utils/deps";

module.exports = {
    data: new SlashCommandBuilder()
        .setName('list')
        .setDescription('List users setup or shockers'),
    async execute(dependencies: InteractionDeps, interaction: ChatInputCommandInteraction) {
        await interaction.reply('Got list command');
    },
};