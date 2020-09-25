import {Message, Permissions, TextChannel} from 'discord.js'
import {sample} from 'lodash'
import Raffle from '../types/mongoose/raffle'
import RaffleEntry, {IRaffleEntry} from '../types/mongoose/raffleentry'

export async function pickwinner(args: string[], message: Message) {
    if (!message.member.hasPermission(Permissions.FLAGS.ADMINISTRATOR)) {
        return await message.channel.send(`You don't have permission to control raffles`)
    }

    const currentRaffle = await Raffle.findOne({endedAt: null})

    if (!currentRaffle) {
        return await message.channel.send('No raffle is currently running')
    }

    const entries: IRaffleEntry[] = await RaffleEntry.find({raffle: currentRaffle._id})

    if (entries.length === 0) return await message.channel.send('Raffle has no entries')

    const winner: IRaffleEntry = sample(entries)

    try {
        await currentRaffle.updateOne({
            winner: winner._id
        })
        const channel: TextChannel = <TextChannel>message.guild.channels.cache.get(currentRaffle.channel)
        return await channel.send(`The winner is <@${winner.discordId}>\n\nProof Screenshot:\n${winner.proof}`)
    } catch (e) {
        return await message.channel.send(`Error writing to db:\n${e}`)
    }
}