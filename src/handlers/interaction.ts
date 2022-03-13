import { CommandInteraction } from 'discord.js'
import { moveInteraction } from '../commands/move'

export async function interactionHandler(interaction: CommandInteraction) {
    switch (interaction.commandName) {
        case 'move':
            return await moveInteraction(interaction)
        default:
            return
    }
}
