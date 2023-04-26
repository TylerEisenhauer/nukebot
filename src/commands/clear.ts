import { SlashCommandBuilder } from '@discordjs/builders'
import { Collection, CommandInteraction, Message, Permissions, TextChannel } from 'discord.js'

import { Command } from '../types/command'

const slashCommand = new SlashCommandBuilder()
  .setName('clear')
  .setDescription('Clears a specified number of messages')
  .addIntegerOption(option =>
    option.setName('numberofmessages')
      .setDescription('The number of messages to clear')
      .setMinValue(1)
      .setMaxValue(99)
      .setRequired(true))

async function executeInteraction(interaction: CommandInteraction) {
  if (!interaction.memberPermissions.has(Permissions.FLAGS.ADMINISTRATOR)) {
    return await interaction.reply(`You're too much of a little bitch for this power.`)
  }
  const limit: number = interaction.options.getInteger('numberofmessages') + 1
  await interaction.reply({ content: `Deleting ${limit - 1} messages`, ephemeral: true })
  if (limit > 100) {
    return await interaction.reply(`99 Messages or less buddy.`)
  }
  const messages: Collection<string, Message> = await interaction.channel.messages.fetch({ limit })
  const tempMessage: Message = await interaction.channel.send('I can\'t leave you idiots alone for 5 minutes')

  await (interaction.channel as TextChannel).bulkDelete(messages, true)
  setTimeout(async () => {
    await tempMessage.delete()
  }, 5000)
}

async function execute(args: string[], message: Message) {
  if (!message.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) {
    return await message.channel.send(`You're too much of a little bitch for this power.`)
  }

  const limit: number = parseInt(args[0]) + 1
  if (isNaN(limit)) {
    return await message.channel.send(`Did you miss the day of kindergarten where you learned what a number was? !clear {NUMBER}, moron.`)
  }
  if (limit > 100) {
    return await message.channel.send(`99 Messages or less buddy.`)
  }
  const messages: Collection<string, Message> = await message.channel.messages.fetch({ limit })
  const tempMessage: Message = await message.channel.send('I can\'t leave you idiots alone for 5 minutes')

  await (message.channel as TextChannel).bulkDelete(messages, true)
  setTimeout(async () => {
    await tempMessage.delete()
  }, 5000)
}

module.exports = {
  name: 'clear',
  execute,
  executeInteraction,
  slashCommand
} as Command