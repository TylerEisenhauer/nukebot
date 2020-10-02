import {initializeBlizzardClient} from '../api/blizzard'
import {initializeRaiderIOClient} from '../api/raiderio'
import {initializeNukeBotClient} from '../api/nukebot'

export async function initializeAPIClients(): Promise<void> {
    await Promise.all([
        initializeBlizzardClient(),
        initializeNukeBotClient(),
        initializeRaiderIOClient()
    ])
}