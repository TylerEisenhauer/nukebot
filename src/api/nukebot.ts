import axios, {AxiosInstance} from 'axios'
import {Sale} from '../types/sale'
import {Raffle} from '../types/raffle'
import {RaffleEntry} from '../types/raffleentry'

let apiClient: AxiosInstance

async function getAuthToken(): Promise<string> {
    try {
        const {data} = await axios.post(`${process.env.NUKEBOT_API_URL}/users/login`, {
            username: process.env.NUKEBOT_API_USER,
            password: process.env.NUKEBOT_API_PASSWORD
        })

        return `Bearer ${data.access_token}`
    } catch (e) {
        console.log(e)
    }
    return null
}

export async function initializeNukeBotClient(): Promise<void> {
    apiClient = axios.create({
        baseURL: process.env.NUKEBOT_API_URL,
        headers: {
            Authorization: await getAuthToken()
        },
        timeout: 5000
    })
}

export async function getSales(date?: string): Promise<Sale[]> {
    try {
        const {data} = await apiClient.get<Sale[]>('/sales', {
            params: {
                date
            }
        })
        return data
    } catch (e) {
        if (e.response.status === 404) {
            return []
        }
        throw e
    }
}

export async function getSaleById(id: string): Promise<Sale> {
    try {
        const {data} = await apiClient.get<Sale>(`/sales/${id}`)
        return data
    } catch (e) {
        if (e.response.status === 404) {
            return null
        }
        throw e
    }
}

export async function createSale(sale: Sale): Promise<Sale> {
    const {data} = await apiClient.post<Sale>('/sales', {
        ...sale
    })
    return data
}

export async function updateSale(sale: Sale): Promise<Sale> {
    const {data} = await apiClient.patch<Sale>(`/sales/${sale._id}`, {
        ...sale
    })
    return data
}

export async function deleteSale(sale: Sale): Promise<boolean> {
    try {
        await apiClient.delete(`/sales/${sale._id}`)
        return true
    } catch (e) {
        console.log(e.response.status)
        return false
    }
}

export async function getCurrentRaffle(): Promise<Raffle> {
    try {
        const {data} = await apiClient.get<Raffle>('/raffle')
        return data
    } catch (e) {
        if (e.response.status === 404) return null
        throw e
    }
}

export async function getRaffleById(id: string): Promise<Raffle> {
    try {
        const {data} = await apiClient.get<Raffle>(`/raffle/${id}`)
        return data
    } catch (e) {
        if (e.response.status === 404) return null
        throw e
    }
}

export async function getRaffleEntry(discordId: string, raffleId: string): Promise<RaffleEntry> {
    try {
        const {data} = await apiClient.get<RaffleEntry>(`/raffle/entry`, {
            params: {
                discordId,
                raffleId
            }
        })
        return data
    } catch (e) {
        if (e.response.status === 404) return null
        throw e
    }
}

export async function pickWinner(id: string): Promise<RaffleEntry> {
    try {
        const {data} = await apiClient.get<RaffleEntry>(`/raffle/winner/${id}`)
        return data
    } catch (e) {
        if (e.response.status === 404) return null
        throw e
    }
}

export async function createRaffle(raffle: Raffle): Promise<Raffle> {
    try {
        const {data} = await apiClient.post<Raffle>(`/raffle`, raffle)
        return data
    } catch (e) {
        throw e
    }
}

export async function enterRaffle(entry: RaffleEntry): Promise<RaffleEntry> {
    try {
        const {data} = await apiClient.post<RaffleEntry>(`/raffle/enter`, entry)
        return data
    } catch (e) {
        throw e
    }
}

export async function updateRaffle(raffle: Raffle): Promise<Raffle> {
    try {
        const {data} = await apiClient.patch<Raffle>(`/raffle/${raffle._id}`, raffle)
        return data
    } catch (e) {
        throw e
    }
}

export default {
    getSales,
    getSaleById,
    createSale,
    updateSale,
    deleteSale,
    getCurrentRaffle,
    getRaffleById,
    pickWinner,
    createRaffle,
    enterRaffle,
    updateRaffle,
    getRaffleEntry
}