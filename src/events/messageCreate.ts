import { Message } from 'discord.js'

import { commandHandler } from '../handlers/command'
import { parseArgs } from '../helpers/parsing'

const prefix = '!'

export async function messageCreate(message: Message) {
    if (message.author.bot) return
    let performGamaAlert: boolean = process.env.PERFORM_GAMA_ALERT === 'true'

    if (performGamaAlert && message.author.id === process.env.GAMA_ID && message.channel.id === process.env.ALERT_CHANNEL_ID) {
        await commandHandler('gamapost', null, message)
    }
    if (message.author.id === process.env.PWN_ID && message.channel.id === process.env.ALERT_CHANNEL_ID) {
        await commandHandler('pwnpost', null, message)
    }

    if (!message.content.startsWith(prefix)) return

    const args: string[] = parseArgs(prefix, message.content)
    const command: string = args.shift().toLowerCase()

    if (command.startsWith(prefix)) return

    await commandHandler(command, args, message)
}