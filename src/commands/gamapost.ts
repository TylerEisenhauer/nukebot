import {Message} from 'discord.js'

import {uriRegex} from '../config/constants'
import { Command } from '../types/command'

async function execute(args: string[], message: Message) {
    if (uriRegex.test(message.content) || message.attachments.first()) {
        return message.channel.send('WARNING, POTENTIAL GAMAPOST, PROCEED WITH CAUTION')
    }
}

module.exports = {
    name: 'gamapost',
    execute
} as Command