export interface Entry {
    id: string
    proof: any
}

export interface RaffleDB {
    channel: string
    entries?: Entry[]
    message: string
    winner?: Entry
}