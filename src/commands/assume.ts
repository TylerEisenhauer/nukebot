import { SlashCommandBuilder } from '@discordjs/builders'
import {CommandInteraction, Message} from 'discord.js'

import { Command } from '../types/command'

const slashCommand = new SlashCommandBuilder()
    .setName('assume')
    .setDescription('Taner quote')

async function executeInteraction(interaction: CommandInteraction) {
    return await interaction.reply('\"You assumin little ass bitch\" -Taner 2021')
}

async function execute(args: string[], message: Message) {
    return await message.channel.send('\"You assumin little ass bitch\" -Taner 2021')
}

module.exports = {
    name: 'assume',
    execute,
    executeInteraction,
    slashCommand
} as Command