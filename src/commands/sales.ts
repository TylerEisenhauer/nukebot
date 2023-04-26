import { SlashCommandBuilder } from '@discordjs/builders'
import { Message, Permissions, MessageEmbed, MessageCollector, TextChannel, CommandInteraction, MessageActionRow, MessageButton, MessageComponentInteraction } from 'discord.js'
import { isFinite } from 'lodash'
import moment from 'moment'
import mongoose from 'mongoose'

import { Sale } from '../types/sale'
import nukebotAPI from '../api/nukebot'
import { Command } from '../types/command'

const slashCommand = new SlashCommandBuilder()
  .setName('sales')
  .setDescription('Sales commands')
  .addSubcommand(subcommand =>
    subcommand
      .setName('add')
      .setDescription('Add a sale')
      .addStringOption(option =>
        option
          .setName('buyername')
          .setDescription('The name of the buyer')
          .setRequired(true))
      .addStringOption(option =>
        option
          .setName('buyerbattletag')
          .setDescription('The battletag of the buyer')
          .setRequired(true))
      .addStringOption(option =>
        option
          .setName('service')
          .setDescription('What they are buying')
          .setRequired(true))
      .addStringOption(option =>
        option
          .setName('date')
          .setDescription('What day is the sale (YYYY-MM-DD format)')
          .setRequired(true))
      .addIntegerOption(option =>
        option
          .setName('price')
          .setDescription('How much is the sale')
          .setMinValue(1)
          .setMaxValue(9999999)
          .setRequired(true))
      .addIntegerOption(option =>
        option
          .setName('deposit')
          .setDescription('Amount collected as a deposit')
          .setMinValue(0)
          .setMaxValue(9999999)
          .setRequired(true))
  )
  .addSubcommand(subcommand =>
    subcommand
      .setName('list')
      .setDescription('List sales for a given week')
      .addStringOption(option =>
        option
          .setName('date')
          .setDescription('What day would you like to list (YYYY-MM-DD format)')
          .setRequired(false))
  )
  .addSubcommand(subcommand =>
    subcommand
      .setName('delete')
      .setDescription('Delete a sale')
      .addStringOption(option =>
        option
          .setName('reference')
          .setDescription('Reference Id of the sale to delete (get this from the list command)')
          .setRequired(true))
  )

async function executeInteraction(interaction: CommandInteraction) {
  switch (interaction.options.getSubcommand()) {
    case 'add':
      return await addSaleInteraction(interaction)
    case 'list':
      return await listSalesInteraction(interaction)
    case 'delete':
      return await deleteSaleInteraction(interaction)
    default:
      return await interaction.reply('Invalid subcommand for sales')
  }
}

async function execute(args: string[], message: Message) {
  const subcommand: string = args.length ? args.shift().toLowerCase() : 'list'

  switch (subcommand) {
    case 'add':
      return await addSale(args, message)
    case 'list':
      return await listSales(args, message)
    case 'delete':
      return await deleteSale(args, message)
    default:
      return await message.channel.send('Invalid command')
  }
}

async function addSaleInteraction(interaction: CommandInteraction) {
  if (!interaction.memberPermissions.has(Permissions.FLAGS.ADMINISTRATOR)) {
    return await interaction.reply(`You don't have permission to control sales`)
  }

  let sale: Sale = {
    buyerName: interaction.options.getString('buyername'),
    buyerBattleTag: interaction.options.getString('buyerbattletag'),
    service: interaction.options.getString('service'),
    price: interaction.options.getInteger('price'),
    amountCollected: interaction.options.getInteger('deposit')
  }

  const date = moment.utc(interaction.options.getString('date'))
  if (date.isValid()) {
    sale.date = date.toDate()
  } else {
    return await interaction.reply('Invalid date')
  }

  try {
    const embed = createEmbed(await nukebotAPI.createSale(sale))
    await interaction.reply({
      content: `Sale Created`,
      embeds: [embed]
    })
  } catch (e) {
    return await interaction.reply(`Error Creating Sale:\n${e}`)
  }
}

async function addSale(args: string[], message: Message) {
  if (!message.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) {
    return await message.channel.send(`You don't have permission to control sales`)
  }

  let sale: Sale = {}

  while (!sale.buyerName) {
    sale.buyerName = await askQuestion('What is the buyers name?', message)
  }

  while (!sale.buyerBattleTag) {
    sale.buyerBattleTag = await askQuestion('What is the buyers battletag?', message)
  }

  while (!sale.service) {
    sale.service = await askQuestion('What are they buying?', message)
  }

  while (!sale.date) {
    const date = moment.utc(await askQuestion('What day? (YYYY-MM-DD)', message))
    if (date.isValid()) {
      sale.date = date.toDate()
    } else {
      await message.channel.send('Invalid Date')
    }
  }

  while (!sale.price) {
    const price = parseInt(await askQuestion('How much is the sale? (numbers only)', message))
    if (isFinite(price)) {
      sale.price = price
      break //because if 0 is entered thats a falsy value
    } else {
      await message.channel.send('Invalid Price')
    }
  }

  while (!sale.amountCollected) {
    const price = parseInt(await askQuestion('How much have you collected as a deposit? (numbers only, enter 0 for none)', message))
    if (isFinite(price)) {
      sale.amountCollected = price
      break //because if 0 is entered thats a falsy value
    } else {
      await message.channel.send('Invalid Price')
    }
  }

  try {
    const embed = createEmbed(await nukebotAPI.createSale(sale))
    await message.channel.send({
      content: `Sale Created`,
      embeds: [embed]
    })
  } catch (e) {
    return await message.channel.send(`Error Creating Sale:\n${e}`)
  }
}

async function askQuestion<T>(question: string, message: Message): Promise<string> {
  await message.channel.send(question)

  const response = await message.channel.awaitMessages({
    filter: (m: Message) => m.author.id === message.author.id,
    max: 1
  })

  return response.first().content
}

async function listSalesInteraction(interaction: CommandInteraction) {
  try {
    //TODO: if this falls on monday it does not work correctly
    const inputDate = interaction.options.getString('date')
    const date: moment.Moment = inputDate ? moment.utc(inputDate) : moment.utc()
    if (!date.isValid()) return await interaction.reply('Invalid Date')

    const weekStart = moment(date).startOf('day').day('Tuesday').toDate()
    const weekEnd = moment(weekStart).add(6, 'days').toDate()

    const sales: Sale[] = await nukebotAPI.getSales(date.format('YYYY-MM-DD'))
    if (sales.length) {
      await interaction.reply(`Sales for the week of ${moment.utc(weekStart).format('l')}-${moment.utc(weekEnd).format('l')}`)
      return sales.forEach((sale: Sale) => {
        const embed: MessageEmbed = createEmbed(sale)

        interaction.channel.send({ embeds: [embed] })
      })
    }
    await interaction.reply('No sales found for this week')
  } catch (e) {
    return await interaction.reply(`Error Retrieving Sales:\n${e}`)
  }
}

async function listSales(args: string[], message: Message) {
  try {
    //TODO: if this falls on monday it does not work correctly
    const date: moment.Moment = args[0] ? moment.utc(args[0]) : moment.utc()
    if (!date.isValid()) return await message.channel.send('Invalid Date')
    const weekStart = moment(date).startOf('day').day('Tuesday').toDate()
    const weekEnd = moment(weekStart).add(6, 'days').toDate()

    const sales: Sale[] = await nukebotAPI.getSales(date.format('YYYY-MM-DD'))
    if (sales.length) {
      await message.channel.send(`Sales for the week of ${moment.utc(weekStart).format('l')}-${moment.utc(weekEnd).format('l')}`)
      return sales.forEach((sale: Sale) => {
        const embed: MessageEmbed = createEmbed(sale)

        message.channel.send({ embeds: [embed] })
      })
    }
    await message.channel.send('No sales found for this week')
  } catch (e) {
    return await message.channel.send(`Error Retrieving Sales:\n${e}`)
  }
}

async function deleteSaleInteraction(interaction: CommandInteraction) {
  if (!interaction.memberPermissions.has(Permissions.FLAGS.ADMINISTRATOR)) {
    return await interaction.reply(`You don't have permission to control sales`)
  }

  const referenceId = interaction.options.getString('reference')

  if (!mongoose.Types.ObjectId.isValid(referenceId)) {
    return await interaction.reply('Invalid sale reference')
  }

  try {
    const sale: Sale = await nukebotAPI.getSaleById(referenceId)

    if (sale) {
      const embed: MessageEmbed = createEmbed(sale)

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
        content: `Are you sure you want to delete the following sale? Reply 'yes' within 30 seconds to delete.`,
        embeds: [embed],
        components: [row]
      })

      collector.on('collect', async (i: MessageComponentInteraction) => {
        if (i.customId === 'yes') {
          try {
            await nukebotAPI.deleteSale(sale)
            await i.update({
              content: `Sale has been deleted`,
              embeds: [embed],
              components: []
            })
          } catch (e) {
            await interaction.reply(`Error deleting sale:\n${e}`)
          }
        } else {
          await i.update({
            content: `Sale deletion has been cancelled`,
            embeds: [embed],
            components: []
          })
        }
      })
      return
    }
    return await interaction.reply('Could not find sale')
  } catch (e) {
    return await interaction.reply(`Error Deleting Sale:\n${e}`)
  }
}

async function deleteSale(args: string[], message: Message) {
  if (!message.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) {
    return await message.channel.send(`You don't have permission to control sales`)
  }

  if (!mongoose.Types.ObjectId.isValid(args[0])) {
    return await message.channel.send('Invalid sale reference')
  }

  try {
    const sale: Sale = await nukebotAPI.getSaleById(args[0])

    if (sale) {
      const embed: MessageEmbed = createEmbed(sale)

      await message.channel.send({
        content: `Are you sure you want to delete the following sale? Reply 'yes' within 30 seconds to delete.`,
        embeds: [embed]
      })

      const collector: MessageCollector = new MessageCollector(<TextChannel>message.channel, {
        filter: (m: Message) => m.author.id === message.author.id,
        time: 1000 * 30
      })
      collector.on('collect', async (m: Message) => {
        if (m.content === 'yes') {
          try {
            await nukebotAPI.deleteSale(sale)
            await collector.stop()
            await m.channel.send(`Sale has been deleted`)
          } catch (e) {
            await message.channel.send(`Error deleting sale:\n${e}`)
          }
        }
      })
      return
    }
    return await message.channel.send('Could not find sale')
  } catch (e) {
    return await message.channel.send(`Error Deleting Sale:\n${e}`)
  }
}

function createEmbed(sale: Sale) {
  return new MessageEmbed()
    .setColor(3447003)
    .setAuthor({
      name: `${sale.buyerName} | ${sale.buyerBattleTag} | ${moment.utc(sale.date).format('l')}`
    })
    .setDescription(`**${sale.service}**`)
    .addField('Price', sale.price.toLocaleString(), true)
    .addField('Amount Collected', sale.amountCollected.toLocaleString(), true)
    .addField('Amount Owed', (sale.price - sale.amountCollected).toLocaleString(), true)
    .setFooter({ text: `Reference | ${sale._id}` })
    .setThumbnail('https://i.imgur.com/4AiXzf8.jpg')
}

module.exports = {
  name: 'sales',
  execute,
  executeInteraction,
  slashCommand
} as Command