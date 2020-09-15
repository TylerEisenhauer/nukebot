import {Message, Permissions} from "discord.js";
import * as fs from "fs";
import {RaffleDB} from "../types/raffle.Types";

export async function startraffle(args: string[], message: Message) {
    if (!message.member.hasPermission(Permissions.FLAGS.ADMINISTRATOR)) {
        return await message.channel.send(`You don't have permission to control raffles`)
    }

    if (fs.existsSync('raffle.db')) {
        return await message.channel.send('A raffle is already being run, use the command !endraffle to finish it (THIS DOES NOT PICK A WINNER, USE !pickwinner FOR THIS)')
    }

    if (args.length !== 2) {
        return await message.channel.send('Use the format !startraffle #channel_name \'Message to be included with the raffle\'')
    }

    if (message.mentions.channels.size !== 1) {
        return await message.channel.send('Enter ONE channel to run the raffle in dumbass')
    }

    const raffle: RaffleDB = {
        message: args[1]
    }

    fs.writeFile('raffle.db', JSON.stringify(raffle, null, 2),async (err) => {
        if (err) {
            console.log(err)
            return await message.channel.send(`Error writing db file:\n${err}`)
        }

        await message.mentions.channels.first().send(`New Raffle!\n\n${args[1]}`)
    })
}