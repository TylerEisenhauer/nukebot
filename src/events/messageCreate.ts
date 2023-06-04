import { Message } from 'discord.js'

import { parseArgs } from '../helpers/parsing'
import { ExtendedClient } from '../types/extendedClient'

const prefix = '!'

export async function messageCreate(message: Message) {
  if (message.author.bot) return
  const client: ExtendedClient = message.client
  const performGamaAlert: boolean = process.env.PERFORM_GAMA_ALERT === 'true'

  if (performGamaAlert && message.author.id === process.env.GAMA_ID && message.channel.id === process.env.ALERT_CHANNEL_ID) {
    await client.commands.get('gamapost').execute([], message)
  }
  if (message.author.id === process.env.PWN_ID && message.channel.id === process.env.ALERT_CHANNEL_ID) {
    await client.commands.get('pwnpost').execute([], message)
  }

  if (!message.content.startsWith(prefix)) return

  const args: string[] = parseArgs(prefix, message.content)
  const command: string = args?.shift().toLowerCase()

  if (!command || command.startsWith(prefix)) return
  await client.commands.get(command)?.execute(args, message)
}