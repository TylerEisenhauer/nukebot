import { SlashCommandBuilder } from '@discordjs/builders'
import { ChannelType } from 'discord-api-types/v9'
import { Collection, CommandInteraction, GuildMember, Message, Permissions, VoiceChannel } from 'discord.js'

import { Command } from '../types/command'

const slashCommand = new SlashCommandBuilder()
    .setName('move')
    .setDescription('Moves all users from one channel to another')
    .addChannelOption(option =>
        option.setName('fromchannel')
            .setDescription('The channel to move members from')
            .addChannelType(ChannelType.GuildVoice.valueOf())
            .setRequired(true))
    .addChannelOption(option =>
        option.setName('tochannel')
            .setDescription('The channel to move members to')
            .addChannelType(ChannelType.GuildVoice.valueOf())
            .setRequired(true))

async function executeInteraction(interaction: CommandInteraction) {
    if (!interaction.memberPermissions.has(Permissions.FLAGS.ADMINISTRATOR)) {
        return await interaction.reply(`Can you shut the fuck up for a second? I can't help you if you're a retard.`)
    }

    const fromChannel: VoiceChannel = interaction.options.getChannel('fromchannel') as VoiceChannel
    const toChannel: VoiceChannel = interaction.options.getChannel('tochannel') as VoiceChannel

    if (fromChannel && toChannel) {
        const users: Collection<string, GuildMember> = fromChannel.members

        await interaction.reply(`Helping ${fromChannel.members.size} clowns meander to ${toChannel.name}`)

        await Promise.all(users.map((async (user: GuildMember) => {
            await user.voice.setChannel(toChannel.id)
        })))
    } else {
        await interaction.reply('At least one of those channels doesn\'t exist')
    }
}

async function execute(args: string[], message: Message) {
    if (!message.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) {
        return await message.channel.send(`Can you shut the fuck up for a second? I can't help you if you're a retard.`)
    }
    if (args.length != 2) {
        return await message.channel.send('Mention exactly TWO channels retard.')
    }

    const fromChannel: VoiceChannel = message.guild.channels.cache.find((x) => {
        return x.type === 'GUILD_VOICE' && x.name === args[0]
    }) as VoiceChannel
    const toChannel: VoiceChannel = message.guild.channels.cache.find((x) => {
        return x.type === 'GUILD_VOICE' && x.name === args[1]
    }) as VoiceChannel

    if (fromChannel && toChannel) {
        const users: Collection<string, GuildMember> = fromChannel.members

        await message.channel.send(`Helping ${fromChannel.members.size} clowns meander to ${toChannel.name}`)

        await Promise.all(users.map((async (user: GuildMember) => {
            await user.voice.setChannel(toChannel.id)
        })))
    } else {
        return await message.channel.send('At least one of those channels doesn\'t exist')
    }
}

module.exports = {
    name: 'move',
    execute,
    executeInteraction,
    slashCommand
} as Command