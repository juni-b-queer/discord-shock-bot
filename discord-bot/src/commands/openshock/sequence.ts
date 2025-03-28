import {
    AutocompleteInteraction,
    ChatInputCommandInteraction,
    EmbedBuilder,
    GuildMember,
    SlashCommandBuilder,
} from 'discord.js';
import { InteractionDeps } from '../../utils/deps';
import { eq } from 'drizzle-orm';
import { shockersTable, usersTable } from '../../db/schema';
import { shockerAutocomplete } from '../../utils/autocomplete';
import { OpenshockControlSchema } from '../../openshockAPI/openshockClient';
import { sequenceParser } from '../../openshockAPI/controlUtils';
import { debugLog } from '../../utils/debug';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('sequence')
        .setDescription('Run a sequence of actions for a shocker')
        .addMentionableOption((option) =>
            option
                .setName('user')
                .setDescription('The User to shock')
                .setRequired(true)
        )
        .addStringOption((option) =>
            option
                .setName('sequencestring')
                .setDescription(
                    'The sequence string ({s,v}-{intensity}-{seconds} separated by commas)'
                )
                .setAutocomplete(true)
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
        const user =
            await dependencies.dbClient.getUserFromInteractionOptions(
                interaction
            );

        if (!user) {
            return await interaction.reply('User not registered.');
        }
        if (user.paused) {
            return await interaction.reply(
                'This user has paused their shockers'
            );
        }
        if (user.apiKey === null) {
            return await interaction.reply('User has no API key');
        }

        const shockerInput = interaction.options.getString('shocker');

        let shockerId: string;

        if (shockerInput) {
            const shocker = user.shockers.find(
                (shocker) => shocker.name === shockerInput
            );
            if (!shocker) {
                return await interaction.reply('Shocker not found');
            }
            shockerId = shocker.shockerId;
        } else {
            let shocker = await dependencies.dbClient.getUserDefaultShocker(
                user.userId
            );
            if (!shocker) {
                shocker = user.shockers[0];
            }
            shockerId = shocker.shockerId;
        }

        const sequenceString = interaction.options.getString('sequencestring')!;

        debugLog(
            'INFO',
            'sequence',
            `running ${sequenceString} for ${user.globalName}`
        );

        const sequenceCommands: OpenshockControlSchema[] = sequenceParser(
            shockerId,
            sequenceString,
            user.intensityLimit
        );

        const fields = [];

        let time = 0;
        for (const command of sequenceCommands) {
            fields.push({
                name: `${command.type} for ${command.duration}ms at ${command.intensity}%`,
                value: ``,
            });
            setTimeout(() => {
                dependencies.openshockClient.controlDevice(user.apiKey!, [
                    command,
                ]);
            }, time);
            time += command.duration;
        }

        // await dependencies.openshockClient.controlDevice(user.apiKey, sequenceCommands)
        const sequenceEmbed = new EmbedBuilder()
            .setColor(0x0099ff)
            .setTitle(`Running sequence for ${user.globalName}`)
            .setDescription(`${sequenceString}`)
            .setFields(...fields);

        // parse sequence
        await interaction.reply({ embeds: [sequenceEmbed] });
    },
    async autocomplete(
        dependencies: InteractionDeps,
        interaction: AutocompleteInteraction
    ) {
        const focusedOption = interaction.options.getFocused(true);
        if (focusedOption.name === 'sequencestring') {
            const guild = await dependencies.dbClient.getGuild(
                interaction.guildId!
            );

            if (!guild) {
                await interaction.respond([]);
            }

            const focusedValue = interaction.options.getFocused();
            const filtered = guild!.sequences.filter((choice) =>
                choice.name.includes(focusedValue)
            );
            await interaction.respond(
                filtered.map((choice) => ({
                    name: `${choice.name} (${choice.sequence})`,
                    value: choice.sequence,
                }))
            );
        }
        if (focusedOption.name === 'shocker') {
            await shockerAutocomplete(dependencies, interaction);
        }
    },
};
