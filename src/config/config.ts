import {initializeBlizzardClient} from '../api/blizzard'
import {initializeRaiderIOClient} from '../api/raiderio'

export async function initializeAPIClients(): Promise<void> {
    await initializeBlizzardClient()
    initializeRaiderIOClient()
}