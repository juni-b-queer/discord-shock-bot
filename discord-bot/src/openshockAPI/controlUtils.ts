import {InteractionDeps} from "../utils/deps";
import {ChatInputCommandInteraction, GuildMember, MessageFlags} from "discord.js";
import {OpenshockControlSchema} from "./openshockClient";
import {debugLog} from "../utils/debug";

export async function generateAndRunBasicControlRequests(dependencies: InteractionDeps, interaction: ChatInputCommandInteraction, action:"Shock"|"Vibrate") {
    const options = {
        duration: interaction.options.getNumber('duration')!,
        intensity: interaction.options.getNumber('intensity')!,
        shocker: interaction.options.getString('shocker'),
    }
    const user = await dependencies.dbClient.getUserFromInteractionOptions(interaction)

    if(!user){
        return await interaction.reply({content:'User not registered.', flags:MessageFlags.Ephemeral})
    }
    if(!user.apiKey){
        return await interaction.reply({content: 'User has not set up their shockers', flags:MessageFlags.Ephemeral})
    }
    if(user.paused){
        return await interaction.reply({content: 'This user has paused their shockers', flags:MessageFlags.Ephemeral})
    }
    if(user.intensityLimit < options.intensity){
        return await interaction.reply({content: `This user has an intensity limit of ${user.intensityLimit}`, flags:MessageFlags.Ephemeral})
    }

    await interaction.deferReply();

    const apiKey = user.apiKey;

    const shockerIds = [];
    if(options.shocker === null){
        const defaultShocker = await dependencies.dbClient.getUserDefaultShocker(user.userId)

        if(!defaultShocker){
            user.shockers.forEach(shocker => shockerIds.push(shocker.shockerId))
        }else{
            shockerIds.push(defaultShocker.shockerId)
        }
    }else{
        const selectedShocker = user.shockers
            .find(shocker => shocker.name === options.shocker)!
        shockerIds.push(selectedShocker.shockerId)
    }


    const controlRequests: OpenshockControlSchema[] = []
    // make openshock api call with this key
    for (const shockerId of shockerIds) {
        controlRequests.push(
            {
                duration: options.duration,
                exclusive: false,
                id: shockerId,
                intensity: options.intensity,
                type: action

            }
        )
    }

    await dependencies.openshockClient.controlDevice(apiKey, controlRequests)

    const messageAction = action === "Shock" ? "Shocking" : "Vibrating"

    const output = `${messageAction} ${user.globalName} for ${options.duration}ms with intensity ${options.intensity}`
    await interaction.followUp(output);

    debugLog("INFO", action, output)
}