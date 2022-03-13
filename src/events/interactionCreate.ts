import { Interaction } from "discord.js";
import { interactionHandler } from "../handlers/interaction";

export async function interactionCreate(interaction: Interaction) {
    if (!interaction.isCommand()) return

    await interactionHandler(interaction)
}