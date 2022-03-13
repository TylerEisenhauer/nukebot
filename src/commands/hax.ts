import { SlashCommandBuilder } from '@discordjs/builders'
import { CommandInteraction, Message } from 'discord.js'

import { Command } from '../types/command'

const hax: string = 'Space jam is kind of know for using exploits and cheating for kills so there could be something ghetto going on. I remember when they had their enchance shamans using double wind fury procs to do like double dps for their aotc sire kill'

const slashCommand = new SlashCommandBuilder()
    .setName('hax')
    .setDescription('Weeb guild quote')

async function executeInteraction(interaction: CommandInteraction) {
    return await interaction.reply(hax)
}

async function execute(args: string[], message: Message) {
    return await message.channel.send(hax)
}

module.exports = {
    name: 'hax',
    execute,
    executeInteraction,
    slashCommand
} as Command