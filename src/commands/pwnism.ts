import { SlashCommandBuilder } from '@discordjs/builders'
import { CommandInteraction, Message } from 'discord.js'

import nukebotAPI from '../api/nukebot'
import { Command } from '../types/command'

const slashCommand = new SlashCommandBuilder()
  .setName('pwnism')
  .setDescription('return a random pwnism')

async function executeInteraction(interaction: CommandInteraction) {
  const pwnism = await nukebotAPI.getPwnism()

  return await interaction.reply(pwnism.quote)
}

async function execute(args: string[], message: Message) {
  const pwnism = await nukebotAPI.getPwnism()

  return await message.channel.send(pwnism.quote)
}

module.exports = {
  name: 'pwnism',
  execute,
  executeInteraction,
  slashCommand
} as Command