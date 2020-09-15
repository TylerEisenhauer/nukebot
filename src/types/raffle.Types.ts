export interface Entry {
    id: number
    proof: any
}

export interface RaffleDB {
    message: string
    entries?: Entry[]
}