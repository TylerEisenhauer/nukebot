import {Message} from 'discord.js'

export async function gamapost(message: Message) {
    const regex: RegExp = /(https?|chrome):\/\/[^\s$.?#].[^\s]*/gm
    console.log(message.attachments.first())
    if (regex.test(message.content) || message.attachments.first()) {
        return message.channel.send('WARNING, POTENTIAL GAMAPOST, PROCEED WITH CAUTION')
    }
}