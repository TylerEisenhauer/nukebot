import {GuildMember, Message, Permissions} from 'discord.js'
import moment from 'moment'

export async function userinfo(args: string[], message: Message) {
    if (!message.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) {
        return await message.channel.send(`I'm sorry ${message.member.displayName}, I'm afraid I can't let you do that`)
    }
    if (!args.length) {
        return await message.channel.send('Include a user id you\'d like to look up')
    }

    const user: GuildMember = message.guild.members.cache.find((x) => {
        return x.id === args[0]
    });

    if (!user) {
        return await message.channel.send('User with that id not found')
    }

    return await message.channel.send(JSON.stringify({
        ...user,
        guild: null,
        joinedTimestamp: moment.utc(user.joinedTimestamp).format('MM/DD/YYYY')
    }, null, 2))
}