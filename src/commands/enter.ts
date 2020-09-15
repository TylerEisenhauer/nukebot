import {Message} from "discord.js"
import * as fs from "fs"
import {Entry, RaffleDB} from "../types/raffle.Types"
import {find} from 'lodash'

export async function enter(args: string[], message: Message) {
    if (!fs.existsSync('raffle.json')) {
        return await message.channel.send('No raffle is currently running')
    }

    const raffle: RaffleDB = JSON.parse(fs.readFileSync('raffle.json', 'utf8'))

    if (message.channel.id !== raffle.channel) return await message.channel.send(`This is not the correct channel for the currently running raffle head over to <#${raffle.channel}>`)

    if (find(raffle.entries, (x: Entry) => {
        return x.id === message.member.id
    })) {
        return await message.reply('You have already entered this raffle')
    }

    if (message.attachments.size !== 1) {
        return await message.reply('Enter ONE proof screenshot')
    }

    raffle.entries.push({
        id: message.member.id,
        proof: message.attachments.first().attachment
    })

    fs.writeFile('raffle.json', JSON.stringify(raffle, null, 2),async (err) => {
        if (err) {
            console.log(err)
            return await message.channel.send(`Error writing db file:\n${err}`)
        }

        return await message.channel.send(`<@${message.member.id}> your entry has been received.`)
    })
}