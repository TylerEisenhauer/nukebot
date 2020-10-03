import {Message, Permissions} from 'discord.js'
import {Raffle} from '../types/raffle'
import nukebotAPI from '../api/nukebot'
import moment from 'moment'

export async function startraffle(args: string[], message: Message) {
    if (!message.member.hasPermission(Permissions.FLAGS.ADMINISTRATOR)) {
        return await message.channel.send(`You don't have permission to control raffles`)
    }

    const currentRaffle = await nukebotAPI.getCurrentRaffle()

    if (currentRaffle) {
        return await message.channel.send('A raffle is already being run, use the command !endraffle to finish it (THIS DOES NOT PICK A WINNER, USE !pickwinner FOR THIS)')
    }

    if (args.length !== 2) {
        return await message.channel.send('Use the format !startraffle #channel_name \'Message to be included with the raffle\'')
    }

    if (message.mentions.channels.size !== 1) {
        return await message.channel.send('Enter ONE channel to run the raffle in.')
    }

    try {
        const raffle: Raffle = await nukebotAPI.createRaffle({
            startedAt: moment.utc().toDate(),
            endedAt: null,
            channel: message.mentions.channels.first().id,
            message: args[1],
            winner: null
        })

        await message.mentions.channels.first().send(`New Raffle!\n\n${raffle.message}`)
    } catch (e) {
        return await message.channel.send(`Error creating raffle:\n${e}`)
    }
}