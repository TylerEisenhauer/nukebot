import axios, {AxiosInstance} from 'axios'
import {Character} from "../types/character.Types"

let apiClient: AxiosInstance

export async function initializeBlizzardClient() {
    if (!apiClient) {
        const {data: authRequest} = await axios.get('https://us.battle.net/oauth/token', {
            params: {
                grant_type: 'client_credentials',
                client_id: process.env.BATTLE_NET_API_CLIENT_ID,
                client_secret: process.env.BATTLE_NET_API_SECRET
            }
        })

        apiClient = axios.create({
            baseURL: 'https://us.api.blizzard.com',
            headers: {
                Authorization: `Bearer ${authRequest.access_token}`
            }
        })
    }
}

export async function getCharacter(fields: string[], realm: string, name: string): Promise<Character> {
    const {data} = await apiClient.get<Character>(`/wow/character/${realm}/${name}`, {
        params: {
            fields: fields.toString()
        }
    })

    return data
}