import {Raffle} from './raffle'

export interface RaffleEntry {
    _id?: string
    discordId: string
    name: string
    proof: any
    raffle: Raffle['_id']
    time: Date
}