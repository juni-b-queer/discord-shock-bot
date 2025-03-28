import {
    AutocompleteInteraction,
    ChatInputCommandInteraction,
    EmbedBuilder,
    SlashCommandBuilder,
} from 'discord.js'
import { InteractionDeps } from '../../utils/deps'
import { shockerAutocomplete } from '../../utils/autocomplete'
import { OpenshockControlSchema } from '../../openshockAPI/openshockClient'
import { sequenceParser } from '../../openshockAPI/controlUtils'
import { debugLog } from '../../utils/debug'

export const data = new SlashCommandBuilder()
    .setName('repeat')
    .setDescription('Run a sequence of actions for a shocker that repeats')
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
            .setRequired(true)
            .setAutocomplete(true)
    )
    .addNumberOption((option) =>
        option
            .setName('repetitions')
            .setDescription('The number of times to repeat the sequence')
            .setRequired(true)
    )
    .addStringOption((option) =>
        option
            .setName('shocker')
            .setDescription('The name of the users shocker')
            .setAutocomplete(true)
    )

export async function execute(
    dependencies: InteractionDeps,
    interaction: ChatInputCommandInteraction
) {
    const user =
        await dependencies.dbClient.getUserFromInteractionOptions(interaction)

    if (!user) {
        return await interaction.reply('User not registered.')
    }
    if (user.paused) {
        return await interaction.reply('This user has paused their shockers')
    }
    if (user.apiKey === null) {
        return await interaction.reply('User has no API key')
    }

    const shockerInput = interaction.options.getString('shocker')

    let shockerId: string

    if (shockerInput) {
        const shocker = user.shockers.find(
            (shocker) => shocker.name === shockerInput
        )
        if (!shocker) {
            return await interaction.reply('Shocker not found')
        }
        shockerId = shocker.shockerId
    } else {
        let shocker = await dependencies.dbClient.getUserDefaultShocker(
            user.userId
        )
        if (!shocker) {
            shocker = user.shockers[0]
        }
        shockerId = shocker.shockerId
    }

    const sequenceString = interaction.options.getString('sequencestring')!
    const repetitions = interaction.options.getNumber('repetitions')!

    debugLog(
        'INFO',
        'repeat',
        `running ${sequenceString} for ${user.globalName} ${repetitions} times`
    )

    const sequenceCommands: OpenshockControlSchema[] = sequenceParser(
        shockerId,
        sequenceString,
        user.intensityLimit
    )
    const fields = []

    let time = 0
    for (let i = 0; i < repetitions; i++) {
        for (const command of sequenceCommands) {
            if (i === 0) {
                fields.push({
                    name: `${command.type} for ${command.duration}ms at ${command.intensity}%`,
                    value: ``,
                })
            }
            setTimeout(() => {
                dependencies.openshockClient.controlDevice(user.apiKey!, [
                    command,
                ])
            }, time)
            time += command.duration
        }
    }

    // await dependencies.openshockClient.controlDevice(user.apiKey, sequenceCommands)
    const sequenceEmbed = new EmbedBuilder()
        .setColor(0x0099ff)
        .setTitle(
            `Running sequence ${repetitions} times for ${user.globalName}`
        )
        .setDescription(`${sequenceString}`)
        .setFields(...fields)

    // parse sequence
    await interaction.reply({ embeds: [sequenceEmbed] })
}

export async function autocomplete(
    dependencies: InteractionDeps,
    interaction: AutocompleteInteraction
) {
    const focusedOption = interaction.options.getFocused(true)
    if (focusedOption.name === 'sequencestring') {
        const guild = await dependencies.dbClient.getGuild(interaction.guildId!)

        if (!guild) {
            await interaction.respond([])
        }

        const focusedValue = interaction.options.getFocused()
        const filtered = guild!.sequences.filter((choice) =>
            choice.name.includes(focusedValue)
        )
        await interaction.respond(
            filtered.map((choice) => ({
                name: `${choice.name} (${choice.sequence})`,
                value: choice.sequence,
            }))
        )
    }
    if (focusedOption.name === 'shocker') {
        await shockerAutocomplete(dependencies, interaction)
    }
}
