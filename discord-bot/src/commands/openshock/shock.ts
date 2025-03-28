import {
    AutocompleteInteraction,
    ChatInputCommandInteraction,
    SlashCommandBuilder,
} from 'discord.js'
import { InteractionDeps } from '../../utils/deps'
import { shockerAutocomplete } from '../../utils/autocomplete'
import { generateAndRunBasicControlRequests } from '../../openshockAPI/controlUtils'

export const data = new SlashCommandBuilder()
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
            .setDescription('The shock duration in milliseconds (minimum 300)')
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
    await generateAndRunBasicControlRequests(dependencies, interaction, 'Shock')
}

export async function autocomplete(
    dependencies: InteractionDeps,
    interaction: AutocompleteInteraction
) {
    await shockerAutocomplete(dependencies, interaction)
}
