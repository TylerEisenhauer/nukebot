import {Message, Permissions} from 'discord.js';
import Raffle from '../types/mongoose/raffle';


export async function startraffle(args: string[], message: Message) {
    if (!message.member.hasPermission(Permissions.FLAGS.ADMINISTRATOR)) {
        return await message.channel.send(`You don't have permission to control raffles`)
    }

    const currentRaffle = await Raffle.findOne({endedAt: null})

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
        await Raffle.create({
            startedAt: new Date(),
            endedAt: null,
            channel: message.mentions.channels.first().id,
            message: args[1],
            winner: null
        })
        await message.mentions.channels.first().send(`New Raffle!\n\n${args[1]}`)
    } catch (e) {
        return await message.channel.send(`Error writing to db:\n${e}`)
    }
}