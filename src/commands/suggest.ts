import { SlashCommandBuilder } from '@discordjs/builders'
import { CommandInteraction, GuildMember, Message, TextChannel } from 'discord.js'

import { Command } from '../types/command'

const slashCommand = new SlashCommandBuilder()
  .setName('suggest')
  .setDescription('Send a suggestion to the officers.')
  .addStringOption(option =>
    option
      .setName('suggestion')
      .setDescription('The suggestion to be sent to the officers')
      .setRequired(true))

async function executeInteraction(interaction: CommandInteraction) {
  const suggestion = interaction.options.getString('suggestion')
  const channel = await interaction.guild.channels.fetch(process.env.SUGGESTION_CHANNEL_ID) as TextChannel
  const name = (interaction.member as GuildMember).nickname || interaction.user.username

  await channel.send(`New suggestion from ${name}\n\n${suggestion}`)

  return await interaction.reply({
    content: 'Your suggestion has been submitted',
    ephemeral: true
  })
}

module.exports = {
  name: 'suggest',
  executeInteraction,
  slashCommand
} as Command