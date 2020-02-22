import axios, {AxiosInstance} from 'axios'
import {RaiderIOCharacterData} from "../types/raiderio.Types"

let apiClient: AxiosInstance

export function initializeRaiderIOClient() {
    apiClient = axios.create({
        baseURL: 'https://raider.io'
    })
}

export async function getCharacterData(fields: string[], realm: string, name: string) {
    const {data} = await axios.get<RaiderIOCharacterData>('/api/v1/characters/profile', {
        params: {
            region: 'us',
            realm,
            name,
            fields: fields.toString()
        }
    })

    return data
}