import {Client, Events, MessageFlags} from 'discord.js';
import {InteractionDeps} from "../utils/deps";

module.exports = {
    name: Events.MessageCreate,
    // @ts-ignore
    async execute(dependencies:InteractionDeps, interaction) {
        if(interaction.author.bot) return;

        console.log(`Got message from user: ${interaction.author.username}`)

    },
};