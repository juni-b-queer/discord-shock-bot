import {InteractionDeps} from "../utils/deps";
import {ChatInputCommandInteraction, GuildMember} from "discord.js";
import {eq} from "drizzle-orm";
import {usersTable} from "../db/schema";
import {OpenshockControlSchema} from "./openshockClient";
import {debugLog} from "../utils/debug";

export async function generateAndRunBasicControlRequests(dependencies: InteractionDeps, interaction: ChatInputCommandInteraction, action:"Shock"|"Vibrate") {
    const member: GuildMember = interaction.options.getMentionable('user') as GuildMember;
    const options = {
        duration: interaction.options.getNumber('duration')!,
        intensity: interaction.options.getNumber('intensity')!,
        shocker: interaction.options.getString('shocker'),
        user: member.user.id,
    }
    const user = (await dependencies.database.query.usersTable.findFirst({
        where: eq(usersTable.userId, member.user.id),
        with: {
            shockers: true
        }
    }))
    if(!user){
        return await interaction.reply('User not registered.')
    }
    if(user.paused){
        return await interaction.reply('This user has paused their shockers')
    }

    const apiKey = user.apiKey!;
    const shockerIds = [];
    if(options.shocker === null){
        user.shockers.forEach(shocker => shockerIds.push(shocker.shockerId))
    }else{
        const selectedShocker = user.shockers
            .find(shocker => shocker.name === interaction.options.getString('shocker')!)!
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
    await interaction.reply(output);

    debugLog("INFO", action, output)
}