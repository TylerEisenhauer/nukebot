import { Client } from 'discord.js'
import { initializeAPIClients } from '../config/config'

export async function ready(client: Client) {
  await initializeAPIClients()
  await client.user.setPresence({
    status: 'online',
    activities: [
      {
        name: 'Kicking Doors and Slapping Whores',
        type: 'PLAYING'
      }
    ]
  })
  console.log('Bot Online')
}