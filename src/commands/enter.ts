import {Message} from 'discord.js'
import {Raffle} from '../types/raffle'
import {RaffleEntry} from '../types/raffleentry'
import nukebotAPI from '../api/nukebot'
import moment from 'moment'

export async function enter(args: string[], message: Message) {
    const currentRaffle: Raffle = await nukebotAPI.getCurrentRaffle()

    if (!currentRaffle) {
        return await message.channel.send('No raffle is currently running')
    }

    if (message.channel.id !== currentRaffle.channel) return await message.channel.send(`This is not the correct channel for the currently running raffle head over to <#${currentRaffle.channel}>`)

    const entry: RaffleEntry = await nukebotAPI.getRaffleEntry(message.author.id, currentRaffle._id)

    if (entry) {
        return await message.reply('You have already entered this raffle')
    }

    if (message.attachments.size !== 1) {
        return await message.reply('Enter ONE proof screenshot')
    }

    try {
        await nukebotAPI.enterRaffle({
            discordId: message.author.id,
            name: message.author.username,
            proof: message.attachments.first().attachment,
            raffle: currentRaffle._id,
            time: moment.utc().toDate()
        })
        return await message.channel.send(`<@${message.member.id}> your entry has been received.`)
    } catch (e) {
        return await message.channel.send(`Error entering raffle:\n${e}`)
    }
}