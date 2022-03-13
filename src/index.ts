import { Client, Intents } from 'discord.js'
import { REST } from '@discordjs/rest'
import { Routes } from 'discord-api-types/v9'
import { config } from 'dotenv-flow'
import fs from 'node:fs'
import path from 'node:path'

import { interactionCreate } from './events/interactionCreate'
import { messageCreate } from './events/messageCreate'
import { messageReactionAdd } from './events/messageReactionAdd'
import { ready } from './events/ready'

config()
const client = new Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
        Intents.FLAGS.DIRECT_MESSAGES,
        Intents.FLAGS.DIRECT_MESSAGE_REACTIONS,
        Intents.FLAGS.GUILD_VOICE_STATES
    ]
})

const commands = []
const commandDirectory = path.join(__dirname, 'commands')
const commandFiles = fs.readdirSync(commandDirectory).filter(file => file.endsWith('.js'))

for (const file of commandFiles) {
	const command = require(path.join(commandDirectory, file))
    if (command.slashCommand) commands.push(command.slashCommand.toJSON())
}

client.on('ready', ready)
client.on('messageCreate', messageCreate)
client.on('messageReactionAdd', messageReactionAdd)
client.on('interactionCreate', interactionCreate);

client.login(process.env.DISCORD_TOKEN).then(() => {
    console.log('Login Success')

    const rest = new REST({ version: '9' }).setToken(process.env.DISCORD_TOKEN)
    rest.put(Routes.applicationCommands(client.user.id), { body: commands })
        .then(() => console.log('Successfully registered global application commands.'))
        .catch(console.error)

    // const guildId = process.env.DEV_GUILD_ID
    // rest.put(Routes.applicationGuildCommands(client.user.id, guildId), { body: commands })
    //     .then(() => console.log('Successfully registered application commands.'))
    //     .catch(console.error)
}).catch((e) => {
    console.log(e)
})

