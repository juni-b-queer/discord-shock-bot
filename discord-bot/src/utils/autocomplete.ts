import {InteractionDeps} from "./deps";
import {AutocompleteInteraction} from "discord.js";
import {eq} from "drizzle-orm";
import {usersTable} from "../db/schema";

export async function shockerAutocomplete(dependencies: InteractionDeps, interaction: AutocompleteInteraction){
    const userOption: string = interaction.options.get('user')!.value as string
    const user = (await dependencies.database.query.usersTable.findFirst({
        where: eq(usersTable.userId, userOption),
        with: {
            shockers: true,
        }
    }))

    if(!user){
        return []
    }

    const shockers = user.shockers
    const focusedValue = interaction.options.getFocused();
    const choices: string[] = shockers.map(shocker => shocker.name!)
    const filtered = choices.filter(choice => choice.startsWith(focusedValue));
    await interaction.respond(
        filtered.map(choice => ({ name: choice, value: choice })),
    );
}