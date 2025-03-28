import {
    AutocompleteInteraction,
    ChatInputCommandInteraction,
    EmbedBuilder,
    GuildMember,
    MessageFlags,
    SlashCommandBuilder,
} from 'discord.js';
import { InteractionDeps } from '../../utils/deps';
import { eq } from 'drizzle-orm';
import { shockersTable, usersTable } from '../../db/schema';
import { shockerAutocomplete } from '../../utils/autocomplete';
import { OpenshockControlSchema } from '../../openshockAPI/openshockClient';
import { sequenceParser } from '../../openshockAPI/controlUtils';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('savesequence')
        .setDescription('Save a sequence to use later')
        .addStringOption((option) =>
            option
                .setName('name')
                .setDescription('Name of the sequence')
                .setRequired(true)
        )
        .addStringOption((option) =>
            option
                .setName('sequencestring')
                .setDescription(
                    'The sequence string ({s,v}-{intensity}-{seconds} separated by commas)'
                )
                .setRequired(true)
        ),
    async execute(
        dependencies: InteractionDeps,
        interaction: ChatInputCommandInteraction
    ) {
        const sequenceString = interaction.options.getString('sequencestring')!;
        const name = interaction.options.getString('name')!;
        const guildId = interaction.guildId!;
        const userId = interaction.user.id;

        await dependencies.dbClient.saveSequence(
            sequenceString,
            name,
            userId,
            guildId
        );

        await interaction.reply({
            content: `Sequence ${sequenceString} saved as ${name}`,
            flags: MessageFlags.Ephemeral,
        });
    },
};
