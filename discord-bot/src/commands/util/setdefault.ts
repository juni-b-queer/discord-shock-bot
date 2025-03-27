import {AutocompleteInteraction, ChatInputCommandInteraction, MessageFlags, SlashCommandBuilder} from 'discord.js';
import {InteractionDeps} from "../../utils/deps";
import {debugLog} from "../../utils/debug";
import {eq} from "drizzle-orm";
import {usersTable} from "../../db/schema";
import {int} from "drizzle-orm/mysql-core";

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setdefault')
        .setDescription('Set your default shocker')
        .addStringOption(option =>
            option.setName('shocker')
                .setDescription('The name of the users shocker')
                .setAutocomplete(true)
                .setRequired(true)),
    async execute(dependencies: InteractionDeps, interaction: ChatInputCommandInteraction) {
        const defaultShocker = interaction.options.getString('shocker')!

        const guildUser = interaction.user.id;
        const setDefault = await dependencies.dbClient.setUserDefaultShocker(guildUser, defaultShocker)

        if(!setDefault){
            return await interaction.reply({content: 'Failed to set default shocker.', flags: MessageFlags.Ephemeral})
        }

        debugLog("INFO", "setDefault", `Changed default shocker to ${defaultShocker} for ${interaction.user.username}`)
        await interaction.reply({content: `Set default shocker to ${defaultShocker}`, flags: MessageFlags.Ephemeral});
    },
    async autocomplete(dependencies: InteractionDeps, interaction: AutocompleteInteraction) {
        const user = (await dependencies.database.query.usersTable.findFirst({
            where: eq(usersTable.userId, interaction.user.id),
            with: {
                shockers: true,
            }
        }))!

        const shockers = user.shockers
        const focusedValue = interaction.options.getFocused();
        const choices: string[] = shockers.map(shocker => shocker.name!)
        const filtered = choices.filter(choice => choice.startsWith(focusedValue));
        await interaction.respond(
            filtered.map(choice => ({ name: choice, value: choice })),
        );
    }
};