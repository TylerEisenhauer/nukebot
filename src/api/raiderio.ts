import axios, {AxiosInstance} from 'axios'
import {RaiderIOCharacterData} from "../types/raiderio.Types"

let apiClient: AxiosInstance

export function initializeRaiderIOClient() {
    apiClient = axios.create({
        baseURL: 'https://raider.io',
        timeout: 5000 //raider io sucks and is down/slow A LOT
    })
}

export async function getCharacterData(fields: string[], realm: string, name: string) {
    try {
        const {data} = await apiClient.get<RaiderIOCharacterData>('/api/v1/characters/profile', {
            params: {
                region: 'us',
                realm,
                name,
                fields: fields.toString()
            }
        })

        return data
    } catch (e) {
        console.log(e)
    }
}