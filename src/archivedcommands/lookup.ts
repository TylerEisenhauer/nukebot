import { SlashCommandBuilder } from '@discordjs/builders'
import { CommandInteraction, Message, MessageEmbed } from 'discord.js'
import { find } from 'lodash'
import { utc } from 'moment'

import { DungeonRun, RaiderIOCharacterData } from '../types/raiderio.Types'
import { getCharacter, getCharacterEquipment, getCharacterMedia, getCharacterRaidProgress } from '../api/blizzard'
import { getCharacterData } from '../api/raiderio'
import { Command } from '../types/command'
import { Character, Encounters, Expansions, Instance, Mode } from '../types/character.Types'

const slashCommand = new SlashCommandBuilder()
    .setName('lookup')
    .setDescription('Lookup a world of warcraft character')
    .addStringOption(option =>
        option
            .setName('realm')
            .setDescription('Realm the character is on')
            .setRequired(true))
    .addStringOption(option =>
        option
            .setName('name')
            .setDescription('Name of the character')
            .setRequired(true))

async function executeInteraction(interaction: CommandInteraction) {
    const realm: string = interaction.options.getString('realm')
    const name: string = interaction.options.getString('name')

    const character: Character = await getCharacter(realm, name)
    if (!character) {
        return await interaction.reply('Character not found')
    }
    character.encounters = await getCharacterRaidProgress(realm, name)
    character.equipment = await getCharacterEquipment(realm, name)
    character.media = await getCharacterMedia(realm, name)

    const raiderIOData: RaiderIOCharacterData = await getCharacterData(['mythic_plus_best_runs', 'mythic_plus_scores_by_season:current'], realm, name)

    const embed = buildEmbed(character, raiderIOData)

    return await interaction.reply({
        embeds: [embed]
    })
}

async function execute(args: string[], message: Message) {
    const character: Character = await getCharacter(args[0], args[1])
    if (!character) {
        return await message.channel.send('Character not found')
    }
    character.encounters = await getCharacterRaidProgress(args[0], args[1])
    character.equipment = await getCharacterEquipment(args[0], args[1])
    character.media = await getCharacterMedia(args[0], args[1])

    const raiderIOData: RaiderIOCharacterData = await getCharacterData(['mythic_plus_best_runs', 'mythic_plus_scores_by_season:current'], args[0], args[1])

    const embed = buildEmbed(character, raiderIOData)

    return await message.channel.send({
        embeds: [embed]
    })
}

function buildEmbed(character: Character, raiderIOData: RaiderIOCharacterData): MessageEmbed {
    const embed: MessageEmbed = new MessageEmbed()
        .setColor(3447003)
        .setAuthor({
            name: `${character.name} - ${character.realm.name.en_US} | ${character.covenant_progress.chosen_covenant.name.en_US} ${character.active_spec.name.en_US} ${character.character_class.name.en_US} | ${character.equipped_item_level} ilvl | Renown Level ${character.covenant_progress.renown_level}`,
            url: `https://worldofwarcraft.com/en-us/character/${character.realm}/${character.name}`
        })
        .setThumbnail(character.media.avatar_url)
        .setDescription('Character data and stuff')
        .addFields(
            {
                name: 'Raid Progress',
                value: buildRecentRaidList(character.encounters),
                inline: true
            },
            {
                name: 'Mythic Plus',
                value: buildMythicPlusDungeonList(raiderIOData),
                inline: true
            }
        )

    return embed
}

function buildRecentRaidList(raids: Encounters[]): string {
    let dataString: string = ''

    if (!raids) {
        dataString = '**Battle.net API is Down**'
    } else {
        const currentExpansion: Encounters = find(raids, (x: Encounters) => {
            return x.expansion.id === Expansions.Shadowlands
        })
        for (let i: number = currentExpansion.instances.length - 1; i >= 0; i--) {
            const raid: Instance = currentExpansion.instances[i]
            const highestDifficulty: Mode = raid.modes[raid.modes.length - 1]
            dataString = dataString.concat(`**${raid.instance.name}:** ${highestDifficulty.progress.completed_count}/${highestDifficulty.progress.total_count}${highestDifficulty.difficulty.type.slice(0, 1)}\n`)
        }
    }
    return dataString
}

function buildMythicPlusDungeonList(raiderIOData: RaiderIOCharacterData): string {
    let dataString: string

    if (!raiderIOData) {
        dataString = '**RaiderIO is down AF**'
    } else {
        dataString = `Raider.IO Score: ${raiderIOData.mythic_plus_scores_by_season[0].scores.all}\n`
        for (let i = 0; i < Math.min(raiderIOData.mythic_plus_best_runs.length, 3); i++) {
            const dungeon: DungeonRun = raiderIOData.mythic_plus_best_runs[i]
            const formatString = dungeon.clear_time_ms >= 3600000 ? 'HH:mm:ss' : 'mm:ss'
            const timeString = utc(dungeon.clear_time_ms).format(formatString)
            dataString = dataString.concat(`**+${dungeon.mythic_level}** - ${dungeon.short_name} - ${timeString}\n`)
        }
    }

    return dataString
}

module.exports = {
    name: 'lookup',
    execute,
    executeInteraction,
    slashCommand
} as Command