import { SlashCommandBuilder } from '@discordjs/builders'
import { Collection, CommandInteraction, GuildMember, Message, Permissions, VoiceChannel } from 'discord.js'

export const slashCommand = new SlashCommandBuilder()
    .setName('move')
    .setDescription('Moves all users from one channel to another')
    .addStringOption(option =>
        option.setName('fromchannel')
            .setDescription('The channel to move members from')
            .setRequired(true))
    .addStringOption(option =>
        option.setName('tochannel')
            .setDescription('The channel to move members to')
            .setRequired(true))

export async function moveInteraction(interaction: CommandInteraction) {
    if (!interaction.memberPermissions.has(Permissions.FLAGS.ADMINISTRATOR)) {
        return await interaction.reply(`Can you shut the fuck up for a second? I can't help you if you're a retard.`)
    }

    const fromChannel: VoiceChannel = interaction.guild.channels.cache.find((x) => {
        return x.type === 'GUILD_VOICE' && x.name === interaction.options.getString('fromchannel')
    }) as VoiceChannel
    const toChannel: VoiceChannel = interaction.guild.channels.cache.find((x) => {
        return x.type === 'GUILD_VOICE' && x.name === interaction.options.getString('tochannel')
    }) as VoiceChannel

    if (fromChannel && toChannel) {
        const users: Collection<string, GuildMember> = fromChannel.members

        await interaction.reply(`Helping ${fromChannel.members.size} clowns meander to ${toChannel.name}`)

        await Promise.all(users.map((async (user: GuildMember) => {
            await user.voice.setChannel(toChannel.id)
        })))
    } else {
        return await interaction.reply('At least one of those channels doesn\'t exist')
    }
}

export async function move(args: string[], message: Message) {
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