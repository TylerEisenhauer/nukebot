import {EmojiResolvable, Message} from 'discord.js'

import {uriRegex} from '../config/constants'
import { Command } from '../types/command'

async function execute(args: string[], message: Message) {
    if (uriRegex.test(message.content) || message.attachments.first()) {
        const emoji: EmojiResolvable = message.guild.emojis.resolveIdentifier(process.env.EMOJI_ID)
        if (emoji) await message.react(emoji)
    }
}

module.exports = {
    name: 'pwnpost',
    execute
} as Command