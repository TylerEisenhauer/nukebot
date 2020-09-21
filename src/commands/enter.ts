import {Message} from 'discord.js'
import Raffle, {IRaffle} from '../types/mongoose/raffle';
import RaffleEntry, {IRaffleEntry} from '../types/mongoose/raffleentry';

export async function enter(args: string[], message: Message) {
    const currentRaffle: IRaffle = await Raffle.findOne({endedAt: null})

    if (!currentRaffle) {
        return await message.channel.send('No raffle is currently running')
    }

    if (message.channel.id !== currentRaffle.channel) return await message.channel.send(`This is not the correct channel for the currently running raffle head over to <#${currentRaffle.channel}>`)

    const entry: IRaffleEntry = await RaffleEntry.findOne({discordId: message.author.id, raffle: currentRaffle._id})

    if (entry) {
        return await message.reply('You have already entered this raffle')
    }

    if (message.attachments.size !== 1) {
        return await message.reply('Enter ONE proof screenshot')
    }

    try {
        await RaffleEntry.create({
            discordId: message.author.id,
            name: message.author.username,
            proof: message.attachments.first().attachment,
            raffle: currentRaffle._id,
            time: new Date()
        })
        return await message.channel.send(`<@${message.member.id}> your entry has been received.`)
    } catch (e) {
        return await message.channel.send(`Error writing to db:\n${e}`)
    }
}