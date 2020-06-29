import {Message} from 'discord.js'

export async function gamapost(message: Message) {
    const regex: RegExp = /(https?|chrome):\/\/[^\s$.?#].[^\s]*/gm
    if (regex.test(message.content)) {
        return message.channel.send('WARNING, POTENTIAL GAMAPOST, PROCEED WITH CAUTION')
    }
}