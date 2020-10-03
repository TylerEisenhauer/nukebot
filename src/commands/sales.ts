import {Message, Permissions, MessageEmbed, MessageCollector, TextChannel} from 'discord.js'
import {Sale} from '../types/sale'
import moment from 'moment'
import mongoose from "mongoose"
import {isFinite} from 'lodash'
import nukebotAPI from '../api/nukebot'

export async function sales(args: string[], message: Message) {
    const command: string = args.shift().toLowerCase()

    switch (command) {
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

async function addSale(args: string[], message: Message) {
    if (!message.member.hasPermission(Permissions.FLAGS.ADMINISTRATOR)) {
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
        const date = moment.utc(await askQuestion('What day? (MM/DD/YYYY)', message))
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
            break; //because if 0 is entered thats a falsy value
        } else {
            await message.channel.send('Invalid Price')
        }
    }

    while (!sale.amountCollected) {
        const price = parseInt(await askQuestion('How much have you collected as a deposit? (numbers only, enter 0 for none)', message))
        if (isFinite(price)) {
            sale.amountCollected = price
            break; //because if 0 is entered thats a falsy value
        } else {
            await message.channel.send('Invalid Price')
        }
    }

    try {
        const embed = createEmbed(await nukebotAPI.createSale(sale))
        await message.channel.send(`Sale created`, embed)
    } catch (e) {
        return await message.channel.send(`Error Creating Sale:\n${e}`)
    }
}

async function askQuestion<T>(question: string, message: Message): Promise<string> {
    await message.channel.send(question)

    const response = await message.channel.awaitMessages((m) => m.author.id === message.author.id, {max: 1})

    return response.first().content
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

                message.channel.send(embed)
            })
        }
        await message.channel.send('No sales found for this week')
    } catch (e) {
        return await message.channel.send(`Error Retrieving Sales:\n${e}`)
    }
}

async function deleteSale(args: string[], message: Message) {
    if (!message.member.hasPermission(Permissions.FLAGS.ADMINISTRATOR)) {
        return await message.channel.send(`You don't have permission to control sales`)
    }

    if (!mongoose.Types.ObjectId.isValid(args[0])) {
        return await message.channel.send('Invalid sale reference')
    }

    try {
        const sale: Sale = await nukebotAPI.getSaleById(args[0])

        if (sale) {
            const embed: MessageEmbed = createEmbed(sale)

            await message.channel.send(`Are you sure you want to delete the following sale? Reply 'yes' within 30 seconds to delete.`, embed)

            const collector: MessageCollector = new MessageCollector(<TextChannel>message.channel, (m) => m.author.id === message.author.id, {
                time: 1000 * 30
            })
            collector.on('collect', async (m: Message) => {
                if (m.content === 'yes') {
                    try {
                        await nukebotAPI.deleteSale(sale)
                        await collector.stop()
                        return await m.channel.send(`Sale has been deleted`)
                    } catch (e) {
                        return await message.channel.send(`Error deleting sale:\n${e}`)
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
        .setAuthor(`${sale.buyerName} | ${sale.buyerBattleTag} | ${moment.utc(sale.date).format('l')}`)
        .setDescription(`**${sale.service}**`)
        .addField('Price', sale.price.toLocaleString(), true)
        .addField('Amount Collected', sale.amountCollected.toLocaleString(), true)
        .addField('Amount Owed', (sale.price - sale.amountCollected).toLocaleString(), true)
        .setFooter(`Reference | ${sale._id}`)
        .setThumbnail('https://i.imgur.com/4AiXzf8.jpg')
}