import {initializeBlizzardClient} from './blizzard'
import {initializeRaiderIOClient} from "./raiderio"

export async function initializeAPIClients(): Promise<void> {
    await initializeBlizzardClient()
    initializeRaiderIOClient()
}