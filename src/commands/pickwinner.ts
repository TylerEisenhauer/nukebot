import {Message, Permissions} from "discord.js";
import * as fs from "fs";
import {Entry, RaffleDB} from "../types/raffle.Types";
import {sample} from 'lodash';

export async function pickwinner(args: string[], message: Message) {
    if (!message.member.hasPermission(Permissions.FLAGS.ADMINISTRATOR)) {
        return await message.channel.send(`You don't have permission to control raffles`)
    }

    if (!fs.existsSync('raffle.json')) {
        return await message.channel.send('No raffle is currently running')
    }

    const raffle: RaffleDB = JSON.parse(fs.readFileSync('raffle.json', 'utf8'))

    if (message.channel.id !== raffle.channel) return await message.channel.send(`This is not the correct channel for the currently running raffle head over to <#${raffle.channel}>`)

    const winner: Entry = sample(raffle.entries)

    raffle.winner = winner

    fs.writeFile('raffle.json', JSON.stringify(raffle, null, 2),async (err) => {
        if (err) {
            console.log(err)
            return await message.channel.send(`Error writing db file:\n${err}`)
        }

        return await message.channel.send(`The winner is <@${winner.id}>\n\nProof Screenshot:\n${winner.proof}`)
    })
}