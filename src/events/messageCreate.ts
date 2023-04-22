import { Message } from 'discord.js'

import { parseArgs } from '../helpers/parsing'
import { ExtendedClient } from '../types/extendedClient'
import Sentiment from 'sentiment'

const prefix = '!'

export async function messageCreate(message: Message) {
  if (message.author.bot) return
  const client: ExtendedClient = message.client
  const performGamaAlert: boolean = process.env.PERFORM_GAMA_ALERT === 'true'
  const sentiment = new Sentiment()

  if (performGamaAlert && message.author.id === process.env.GAMA_ID && message.channel.id === process.env.ALERT_CHANNEL_ID) {
    await client.commands.get('gamapost').execute([], message)
  }
  if (message.author.id === process.env.PWN_ID && message.channel.id === process.env.ALERT_CHANNEL_ID) {
    await client.commands.get('pwnpost').execute([], message)
  }
  if (message.channelId === process.env.HEALER_CHANNEL_ID) {
    const result = sentiment.analyze(message.content, {
      extras: {
        'pog': 3
      }
    })
    if (result.comparative < -.2) await message.react('❤️')
  }

  if (!message.content.startsWith(prefix)) return

  const args: string[] = parseArgs(prefix, message.content)
  const command: string = args.shift().toLowerCase()

  if (command.startsWith(prefix)) return
  await client.commands.get(command)?.execute(args, message)
}