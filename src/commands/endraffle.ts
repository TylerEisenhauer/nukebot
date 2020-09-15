import {Message, MessageCollector, Permissions, TextChannel} from "discord.js";
import * as fs from "fs";

export async function endraffle(args: string[], message: Message) {
    if (!message.member.hasPermission(Permissions.FLAGS.ADMINISTRATOR)) {
        return await message.channel.send(`You don't have permission to control raffles`)
    }

    if (!fs.existsSync('raffle.json')) {
        return await message.channel.send('No raffle is currently running')
    }

    await message.reply(`Are you sure you want to end the current raffle entries CAN NOT be recovered. Reply 'yes' within 30 seconds to end.`)

    const collector: MessageCollector = new MessageCollector(<TextChannel>message.channel, (m) => m.author.id === message.author.id, {time: 1000 * 30})
    collector.on('collect', async (m: Message) => {
        if (m.content === 'yes') {
            fs.unlink('raffle.json', async (err) => {
                if (err) {
                    console.log(err)
                    return await m.channel.send(`Error deleting raffle db file:\n\n${err}`)
                }
                return await m.channel.send(`Raffle has been ended`)
            })
        }
    })
}