import {Message, MessageCollector, Permissions, TextChannel} from 'discord.js'
import Raffle from '../types/mongoose/raffle'

export async function endraffle(args: string[], message: Message) {
    if (!message.member.hasPermission(Permissions.FLAGS.ADMINISTRATOR)) {
        return await message.channel.send(`You don't have permission to control raffles`)
    }

    const currentRaffle = await Raffle.findOne({endedAt: null})

    if (!currentRaffle) {
        return await message.channel.send('No raffle is currently running')
    }

    await message.reply(`Are you sure you want to end the current raffle? Reply 'yes' within 30 seconds to end.`)

    const collector: MessageCollector = new MessageCollector(<TextChannel>message.channel, (m) => m.author.id === message.author.id, {time: 1000 * 30})
    collector.on('collect', async (m: Message) => {
        if (m.content === 'yes') {
            try {
                await currentRaffle.updateOne({
                    endedAt: new Date()
                })
                await collector.stop()
                return await m.channel.send(`Raffle has been ended`)
            } catch (e) {
                return await message.channel.send(`Error writing to db:\n${e}`)
            }
        }
    })
}