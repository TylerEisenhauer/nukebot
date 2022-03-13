import { SlashCommandBuilder } from '@discordjs/builders'
import { ChannelType } from 'discord-api-types/v9'
import { CommandInteraction, Message, MessageActionRow, MessageButton, MessageCollector, MessageComponentInteraction, Permissions, TextChannel } from 'discord.js'
import moment from 'moment'

import nukebotAPI from '../api/nukebot'
import { Command } from '../types/command'
import { Raffle } from '../types/raffle'
import { RaffleEntry } from '../types/raffleentry'

const slashCommand = new SlashCommandBuilder()
    .setName('raffle')
    .setDescription('Raffle commands')
    .addSubcommand(subcommand =>
        subcommand.setName('start')
            .setDescription('Start a raffle')
            .addChannelOption(option =>
                option
                    .setName('rafflechannel')
                    .setDescription('The channel to hold the raffle in')
                    .addChannelType(ChannelType.GuildText.valueOf())
                    .setRequired(true))
            .addStringOption(option =>
                option
                    .setName('message')
                    .setDescription('The message to be sent in the raffle channel')
                    .setRequired(true))
    )
    .addSubcommand(subcommand =>
        subcommand.setName('enter')
            .setDescription('Enter the currently running raffle')
    )
    .addSubcommand(subcommand =>
        subcommand.setName('pickwinner')
            .setDescription('Pick a winner for the current raffle')
    )
    .addSubcommand(subcommand =>
        subcommand.setName('end')
            .setDescription('End the currently running raffle')
    )

async function executeInteraction(interaction: CommandInteraction) {
    switch (interaction.options.getSubcommand()) {
        case 'start':
            return await startraffleInteraction(interaction)
        case 'enter':
            return await enterInteraction(interaction)
        case 'pickwinner':
            return await pickwinnerInteraction(interaction)
        case 'end':
            return await endraffleInteraction(interaction)
        default:
            return await interaction.reply('Invalid subcommand for raffle')
    }
}

async function execute(args: string[], message: Message) {
    const subcommand = args.shift()

    switch (subcommand) {
        case 'start':
            return await startraffle(args, message)
        case 'enter':
            return await enter(args, message)
        case 'pickwinner':
            return await pickwinner(args, message)
        case 'end':
            return await endraffle(args, message)
        default:
            return await message.channel.send('Invalid subcommand for raffle')
    }
}

async function startraffleInteraction(interaction: CommandInteraction) {
    if (!interaction.memberPermissions.has(Permissions.FLAGS.ADMINISTRATOR)) {
        return await interaction.channel.send(`You don't have permission to control raffles`)
    }

    const currentRaffle = await nukebotAPI.getCurrentRaffle()

    if (currentRaffle) {
        return await interaction.reply('A raffle is already being run, use the command !endraffle to finish it (THIS DOES NOT PICK A WINNER, USE !pickwinner FOR THIS)')
    }

    try {
        const channel: TextChannel = interaction.options.getChannel('rafflechannel') as TextChannel

        const raffle: Raffle = await nukebotAPI.createRaffle({
            startedAt: moment.utc().toDate(),
            endedAt: null,
            channel: channel.id,
            message: interaction.options.getString('message'),
            winner: null
        })

        await channel.send(`New Raffle!\n\n${raffle.message}`)
        return await interaction.reply({ content: 'Raffle created', ephemeral: true })
    } catch (e) {
        return await interaction.reply(`Error creating raffle:\n${e}`)
    }
}

async function startraffle(args: string[], message: Message) {
    if (!message.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) {
        return await message.channel.send(`You don't have permission to control raffles`)
    }

    const currentRaffle = await nukebotAPI.getCurrentRaffle()

    if (currentRaffle) {
        return await message.channel.send('A raffle is already being run, use the command !endraffle to finish it (THIS DOES NOT PICK A WINNER, USE !pickwinner FOR THIS)')
    }

    if (args.length !== 2) {
        return await message.channel.send('Use the format !startraffle #channel_name \'Message to be included with the raffle\'')
    }

    if (message.mentions.channels.size !== 1) {
        return await message.channel.send('Enter ONE channel to run the raffle in.')
    }

    try {
        const raffle: Raffle = await nukebotAPI.createRaffle({
            startedAt: moment.utc().toDate(),
            endedAt: null,
            channel: message.mentions.channels.first().id,
            message: args[1],
            winner: null
        })

        await message.mentions.channels.first().send(`New Raffle!\n\n${raffle.message}`)
    } catch (e) {
        return await message.channel.send(`Error creating raffle:\n${e}`)
    }
}

async function enterInteraction(interaction: CommandInteraction) {
    return await interaction.reply('You can currently only enter raffles by using the \'!raffle enter\' command and attaching an image in the same message.')
}

async function enter(args: string[], message: Message) {
    const currentRaffle: Raffle = await nukebotAPI.getCurrentRaffle()

    if (!currentRaffle) {
        return await message.channel.send('No raffle is currently running')
    }

    if (message.channel.id !== currentRaffle.channel) return await message.channel.send(`This is not the correct channel for the currently running raffle head over to <#${currentRaffle.channel}>`)

    const entry: RaffleEntry = await nukebotAPI.getRaffleEntry(message.author.id, currentRaffle._id)

    if (entry) {
        return await message.reply('You have already entered this raffle')
    }

    if (message.attachments.size !== 1) {
        return await message.reply('Enter ONE proof screenshot')
    }

    try {
        await nukebotAPI.enterRaffle({
            discordId: message.author.id,
            name: message.author.username,
            proof: message.attachments.first().attachment,
            raffle: currentRaffle._id,
            time: moment.utc().toDate()
        })
        return await message.channel.send(`<@${message.member.id}> your entry has been received.`)
    } catch (e) {
        return await message.channel.send(`Error entering raffle:\n${e}`)
    }
}

async function pickwinnerInteraction(interaction: CommandInteraction) {
    if (!interaction.memberPermissions.has(Permissions.FLAGS.ADMINISTRATOR)) {
        return await interaction.reply(`You don't have permission to control raffles`)
    }

    try {
        const currentRaffle = await nukebotAPI.getCurrentRaffle()

        if (!currentRaffle) {
            return await interaction.reply('No raffle is currently running')
        }

        const winner: RaffleEntry = await nukebotAPI.pickWinner(currentRaffle._id)

        if (!winner) return await interaction.reply('Raffle has no entries')

        await interaction.reply({content: 'Picking a winner', ephemeral: true})

        const channel: TextChannel = <TextChannel>interaction.guild.channels.cache.get(currentRaffle.channel)
        return await channel.send(`The winner is <@${winner.discordId}>\n\nProof Screenshot:\n${winner.proof}`)
    } catch (e) {
        return await interaction.reply(`Error picking winner:\n${e}`)
    }
}

async function pickwinner(args: string[], message: Message) {
    if (!message.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) {
        return await message.channel.send(`You don't have permission to control raffles`)
    }

    try {
        const currentRaffle = await nukebotAPI.getCurrentRaffle()

        if (!currentRaffle) {
            return await message.channel.send('No raffle is currently running')
        }

        const winner: RaffleEntry = await nukebotAPI.pickWinner(currentRaffle._id)

        if (!winner) return await message.channel.send('Raffle has no entries')

        const channel: TextChannel = <TextChannel>message.guild.channels.cache.get(currentRaffle.channel)
        return await channel.send(`The winner is <@${winner.discordId}>\n\nProof Screenshot:\n${winner.proof}`)
    } catch (e) {
        return await message.channel.send(`Error picking winner:\n${e}`)
    }
}

async function endraffleInteraction(interaction: CommandInteraction) {
    if (!interaction.memberPermissions.has(Permissions.FLAGS.ADMINISTRATOR)) {
        return await interaction.reply(`You don't have permission to control raffles`)
    }

    const currentRaffle = await nukebotAPI.getCurrentRaffle()

    if (!currentRaffle) {
        return await interaction.reply('No raffle is currently running')
    }

    const row = new MessageActionRow()
        .addComponents(
            new MessageButton()
                .setCustomId('no')
                .setLabel('No')
                .setStyle('PRIMARY'),
            new MessageButton()
                .setCustomId('yes')
                .setLabel('Yes')
                .setStyle('DANGER')
        )

    const collector = interaction.channel.createMessageComponentCollector({
        filter: i => i.user.id === interaction.user.id,
        time: 30 * 1000,
        max: 1
    })

    await interaction.reply({
        content: `Are you sure you want to end the current raffle?`,
        components: [row]
    })

    collector.on('collect', async (i: MessageComponentInteraction) => {
        if (i.customId === 'yes') {
            try {
                await nukebotAPI.updateRaffle({
                    ...currentRaffle,
                    endedAt: moment.utc().toDate()
                })
                await i.update({
                    content: `Raffle has been ended`,
                    components: []
                })
            } catch (e) {
                await i.reply({ content: `Error ending raffle:\n${e}`, ephemeral: true })
            }
        } else {
            await i.update({
                content: `Raffle has not been ended`,
                components: []
            })
        }
    })
}

async function endraffle(args: string[], message: Message) {
    if (!message.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) {
        return await message.channel.send(`You don't have permission to control raffles`)
    }

    const currentRaffle = await nukebotAPI.getCurrentRaffle()

    if (!currentRaffle) {
        return await message.channel.send('No raffle is currently running')
    }

    await message.reply(`Are you sure you want to end the current raffle? Reply 'yes' within 30 seconds to end.`)

    const collector: MessageCollector = new MessageCollector(<TextChannel>message.channel, {
        time: 1000 * 30,
        filter: m => m.author.id === message.author.id
    })
    collector.on('collect', async (m: Message) => {
        if (m.content === 'yes') {
            try {
                await nukebotAPI.updateRaffle({
                    ...currentRaffle,
                    endedAt: moment.utc().toDate()
                })
                await collector.stop()
                await m.channel.send(`Raffle has been ended`)
            } catch (e) {
                await message.channel.send(`Error ending raffle:\n${e}`)
            }
        }
    })
}

module.exports = {
    name: 'raffle',
    execute,
    executeInteraction,
    slashCommand
} as Command