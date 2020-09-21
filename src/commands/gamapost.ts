import {Message} from 'discord.js'
import {uriRegex} from '../config/constants'

export async function gamapost(message: Message) {
    if (uriRegex.test(message.content) || message.attachments.first()) {
        return message.channel.send('WARNING, POTENTIAL GAMAPOST, PROCEED WITH CAUTION')
    }
}