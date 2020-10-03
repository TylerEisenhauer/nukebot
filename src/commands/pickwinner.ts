import {Message, Permissions, TextChannel} from 'discord.js'
import {RaffleEntry} from '../types/raffleentry'
import nukebotAPI from '../api/nukebot'

export async function pickwinner(args: string[], message: Message) {
    if (!message.member.hasPermission(Permissions.FLAGS.ADMINISTRATOR)) {
        return await message.channel.send(`You don't have permission to control raffles`)
    }

    try {
        const currentRaffle = await nukebotAPI.getCurrentRaffle()

        if (!currentRaffle) {
            return await message.channel.send('No raffle is currently running')
        }

        const winner: RaffleEntry = await nukebotAPI.pickWinner(currentRaffle._id)

        if (!winner) return await message.channel.send('Raffle has no entries')

        const channel: TextChannel = <TextChannel>message.guild.channels.cache.get(currentRaffle.channel)
        return await channel.send(`The winner is <@${winner.discordId}>\n\nProof Screenshot:\n${winner.proof}`)
    } catch (e) {
        return await message.channel.send(`Error picking winner:\n${e}`)
    }
}