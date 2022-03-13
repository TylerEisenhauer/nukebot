import { MessageReaction, User } from 'discord.js'
import NodeCache from 'node-cache'

const cache = new NodeCache()

export async function messageReactionAdd(reaction: MessageReaction, user: User) {
    if (reaction.emoji.id !== process.env.WTF_ID || cache.has(reaction.message.id)) return

    if (reaction.partial) {
        try {
            await reaction.fetch()
        } catch (e) {
            console.error('Error fetching reaction')
            return
        }
    }

    const originalNickname: string = reaction.message.member.nickname || reaction.message.member.user.username

    if (reaction.count === 5) {
        cache.set(reaction.message.id, true)
        try {
            if (!reaction.message.member.manageable) {
                await reaction.message.channel.send(`${originalNickname} has been voted an idiot, unfortunately I can't change their name`)
                return
            }

            await reaction.message.member.setNickname('KPS Student')
            await reaction.message.channel.send(`${originalNickname} has been voted an idiot, their name has been changed as such`)
        } catch (e) {
            console.error(e)
        } finally {
            setTimeout(async () => {
                await reaction.message.member.setNickname(originalNickname)
            }, 60 * 5 * 1000) //5 Minutes
        }
    }
}