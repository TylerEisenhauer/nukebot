import axios, {AxiosInstance} from 'axios'
import {Character, CharacterMedia, Encounters, Item} from '../types/character.Types'

let apiClient: AxiosInstance

async function getAuthToken(): Promise<string> {
    try {
        const {data: authRequest} = await axios.post('https://us.battle.net/oauth/token',null,{
            params: {
                grant_type: 'client_credentials',
                client_id: process.env.BATTLE_NET_API_CLIENT_ID,
                client_secret: process.env.BATTLE_NET_API_SECRET
            }
        })

        // const {data: authRequest} =
        //     await axios.post('https://us.battle.net/oauth/token', {
        //         grant_type: 'client_credentials',
        //         region: 'us'
        //     }, {
        //         auth: {
        //             username: process.env.BATTLE_NET_API_CLIENT_ID,
        //             password: process.env.BATTLE_NET_API_SECRET
        //         }
        //     })

        return `Bearer ${authRequest.access_token}`
    } catch (e) {
        console.log(e)
    }
    return null
}

export async function initializeBlizzardClient(): Promise<void> {
    apiClient = axios.create({
        baseURL: 'https://us.api.blizzard.com',
        headers: {
            Authorization: await getAuthToken()
        },
        timeout: 5000
    })

    await createResponseInterceptor()
}

async function createResponseInterceptor(): Promise<void> {
    const interceptor: number = apiClient.interceptors.response.use(null, async (error) => {
        try {
            if (error.config && error.response && error.response.status === 401) {
                apiClient.interceptors.response.eject(interceptor) //to avoid looping if somehow the token call returns 401
                const token: string = await getAuthToken()
                Object.assign(apiClient.defaults.headers, {Authorization: token})
                Object.assign(error.config.headers, {Authorization: token})
                return apiClient.request(error.config)
            }
        } catch {
            return Promise.reject(error)
        } finally {
            await createResponseInterceptor()
        }
        throw error
    })
}

export async function getCharacter(realm: string, name: string): Promise<Character> {
    try {
        const {data} = await apiClient.get<Character>(`/profile/wow/character/${realm}/${name}`, {
            headers: {
                'Battlenet-Namespace': 'profile-us'
            }
        })
        return data
    } catch (e) {
        console.log(`Blizzard API Error\nStatus Code: ${e.response.status}`)
    }
}

export async function getCharacterEquipment(realm: string, name: string): Promise<Item[]> {
    try {
        const {data} = await apiClient.get(`/profile/wow/character/${realm}/${name}/equipment`, {
            headers: {
                'Battlenet-Namespace': 'profile-us'
            }
        })
        return data.equipped_items
    } catch (e) {
        console.log(`Blizzard API Error\nStatus Code: ${e.response.status}`)
    }
}

export async function getCharacterRaidProgress(realm: string, name: string): Promise<Encounters[]> {
    try {
        const {data} = await apiClient.get(`/profile/wow/character/${realm}/${name}/encounters/raids`, {
            headers: {
                'Battlenet-Namespace': 'profile-us'
            }
        })
        return data.expansions
    } catch (e) {
        console.log(`Blizzard API Error\nStatus Code: ${e.response.status}`)
    }
}

export async function getCharacterMedia(realm: string, name: string): Promise<CharacterMedia> {
    try {
        const {data} = await apiClient.get(`/profile/wow/character/${realm}/${name}/character-media`, {
            headers: {
                'Battlenet-Namespace': 'profile-us'
            }
        })
        return {
            avatar_url: data.avatar_url,
            bust_url: data.bust_url,
            render_url: data.render_url
        }
    } catch (e) {
        console.log(`Blizzard API Error\nStatus Code: ${e.response.status}`)
    }
}