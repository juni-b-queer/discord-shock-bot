import {
    AutocompleteInteraction,
    ChatInputCommandInteraction,
    CommandInteraction,
    GuildMember,
    SlashCommandBuilder,
} from 'discord.js';
import { InteractionDeps } from '../../utils/deps';
import { shockersTable, usersTable } from '../../db/schema';
import { eq } from 'drizzle-orm';
import { shockerAutocomplete } from '../../utils/autocomplete';
import { OpenshockControlSchema } from '../../openshockAPI/openshockClient';
import { int } from 'drizzle-orm/mysql-core';
import { generateAndRunBasicControlRequests } from '../../openshockAPI/controlUtils';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('shock')
        .setDescription('Shock user')
        .addMentionableOption((option) =>
            option
                .setName('user')
                .setDescription('The User to shock')
                .setRequired(true)
        )
        .addNumberOption((option) =>
            option
                .setName('intensity')
                .setDescription('The shock intensity')
                .setRequired(true)
        )
        .addNumberOption((option) =>
            option
                .setName('duration')
                .setDescription(
                    'The shock duration in milliseconds (minimum 300)'
                )
                .setRequired(true)
        )
        .addStringOption((option) =>
            option
                .setName('shocker')
                .setDescription('The name of the users shocker')
                .setAutocomplete(true)
        ),
    async execute(
        dependencies: InteractionDeps,
        interaction: ChatInputCommandInteraction
    ) {
        await generateAndRunBasicControlRequests(
            dependencies,
            interaction,
            'Shock'
        );
    },
    async autocomplete(
        dependencies: InteractionDeps,
        interaction: AutocompleteInteraction
    ) {
        await shockerAutocomplete(dependencies, interaction);
    },
};
