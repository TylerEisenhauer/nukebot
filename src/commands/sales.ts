import {Message, Permissions, MessageEmbed, MessageCollector, TextChannel} from 'discord.js'
import Sale, {ISale} from '../types/mongoose/sale'
import moment from 'moment'
import mongoose from "mongoose"


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

    try {
        await Sale.create({
            date: moment.utc(args[0]).startOf('day').toDate(),
            buyerName: args[1],
            buyerBattleTag: args[2],
            price: args[3],
            amountCollected: args[4]
        })
        await message.channel.send(`Sale created`)
    } catch (e) {
        return await message.channel.send(`Error Creating Sale:\n${e}`)
    }
}

async function listSales(args: string[], message: Message) {
    try {
        const date: string = args[0] ? args[0] : new Date().toString()
        const weekStart = moment.utc(date).startOf('day').day('Tuesday').toDate()
        const weekEnd = moment.utc(date).startOf('day').day('Tuesday').add(6, 'days').toDate()
        const sales: ISale[] = await Sale.find({date: {$gte: weekStart, $lte: weekEnd}})
        if (sales.length) {
            return sales.forEach((sale: ISale) => {
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
        const sale: ISale = await Sale.findById(args[0])

        if (sale) {
            const embed: MessageEmbed = createEmbed(sale)

            await message.channel.send(`Are you sure you want to delete the following sale? Reply 'yes' within 30 seconds to delete.`, embed)

            const collector: MessageCollector = new MessageCollector(<TextChannel>message.channel, (m) => m.author.id === message.author.id, {
                time: 1000 * 30
            })
            collector.on('collect', async (m: Message) => {
                if (m.content === 'yes') {
                    try {
                        await sale.deleteOne()
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
        return await message.channel.send(`Error Retrieving Sale:\n${e}`)
    }

}

function createEmbed(sale: ISale) {
    return new MessageEmbed()
        .setColor(3447003)
        .setAuthor(`${sale.buyerName} | ${sale.buyerBattleTag} | ${moment.utc(sale.date).format('l')}`)
        .setDescription('Sale Information')
        .addField('Price', sale.price, true)
        .addField('Amount Collected', sale.amountCollected, true)
        .addField('Amount Owed', sale.price - sale.amountCollected, true)
        .setFooter(`Reference | ${sale._id}`)
        .setThumbnail('https://i.imgur.com/4AiXzf8.jpg')
}