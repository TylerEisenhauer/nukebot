import {RaffleEntry} from './raffleentry'

export interface Raffle {
    _id?: string
    startedAt?: Date
    endedAt?: Date
    channel?: string
    message?: string
    winner?: RaffleEntry['_id']
}

