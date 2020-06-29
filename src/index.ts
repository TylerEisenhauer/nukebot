import {Client, Message} from 'discord.js'
import {commandHandler} from './handlers/command'
import {config} from 'dotenv-flow'
import {parseArgs} from './helpers/parsing'
import {initializeAPIClients} from './api/init'

config()
const client = new Client()
const prefix = '!'

client.on('ready', async () => {
    await initializeAPIClients()
    await client.user.setPresence({
        status: 'online',
        activity: {
            name: 'Kicking Doors and Slapping Whores',
            type: 'PLAYING'
        }
    })
    console.log('Bot Online')
})

client.on('message', async (message: Message) => {
    if (message.author.bot) return
    if (!message.guild) return
    let performGamaAlert: boolean = process.env.PERFORM_GAMA_ALERT === 'true'

    if (performGamaAlert && message.author.id === process.env.GAMA_ID && message.channel.id === process.env.ALERT_CHANNEL_ID) {
        return await commandHandler('gamapost', null, message)
    }

    if (!message.content.startsWith(prefix)) return

    const args: string[] = parseArgs(prefix, message.content)
    const command: string = args.shift().toLowerCase()

    return await commandHandler(command, args, message)
})


client.login(process.env.DISCORD_TOKEN).then(() => {
    console.log('Login Success')
}).catch((e) => {
    console.log(e)
})

