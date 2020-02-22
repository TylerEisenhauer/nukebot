export interface Character {
    lastModified: number
    name: string
    realm: string
    battlegroup: string
    class: Class
    race: number
    gender: number
    level: number
    achievementPoints: number
    thumbnail: string
    calcClass: string
    faction: number
    items: Items
    talents: Talents[]
    progression: Progression
    totalHonorableKills: number
    id: number
    status: string
    reason: string
}

export interface Progression {
    raids: Raid[]
}

export interface Raid {
    name: string
    lfr: number
    normal: number
    heroic: number
    mythic: number
    id: number
    bosses: Boss[]
}

export interface Boss {
    id: number
    name: string
    lfrKills: number
    lfrTimestamp: number
    normalKills: number
    normalTimestamp: number
    heroicKills: number
    heroicTimestamp: number
    mythicKills: number
    mythicTimestamp: number
}

export interface Talents {
    selected: boolean
    talents: Talent[]
    spec: Spec
}

export interface Talent {
    tier: number
    column: number
    spell: Spell
    spec?: Spec
    calcTalent: string
    calcSpec: string
}

export interface Spell {
    id: number
    name: string
    icon: string
    description: string
    range: string
    castTime: string,
    cooldown: string
}

export interface Spec {
    name: string
    role: string
    backgroundImage: string
    icon: string
    description: string
    order: number
}

export enum Class {
    None,
    Warrior,
    Paladin,
    Hunter,
    Rogue,
    Priest,
    DeathKnight,
    Shaman,
    Mage,
    Warlock,
    Monk,
    Druid,
    DemonHunter,
}

export interface Items {
    averageItemLevel: number,
    averageItemLevelEquipped: number,
    head: Item
    neck: Item
    shoulder: Item
    back: Item
    chest: Item
    tabard: Item
    wrist: Item
    hands: Item
    waist: Item
    legs: Item
    feet: Item
    finger1: Item
    finger2: Item
    trinket1: Item
    trinket2: Item
    mainHand: Item
    offHand: Item
}

export interface Item {
    id: number
    name: string
    icon: string
    quality: number
    itemLevel: number
    tooltipParams: TooltipParams
    stats: Stat[]
    armor: number
    context: string
    bonusLists: number[]
    displayInfoId: number
    appearance: Appearance
    azeriteEmpoweredItem: AzeriteEmpoweredItem
    azeriteItem: AzeriteItem
}
export interface TooltipParams {
    transmogItem: number
    timewalkerLevel: number
    azeritePower0: number
    azeritePower1: number
    azeritePower2: number
    azeritePower3: number
    azeritePower4: number
    azeritePowerLevel: number
}

export interface Appearance {
    itemId: number
    itemAppearanceModId: number
    transmogItemAppearanceModId: number
}

export interface Stat {
    stat: number
    amount: number
}

export interface AzeriteEmpoweredItem {
    azeritePowers: AzeritePower[]
}

export interface AzeritePower {
    id: number
    tier: number
    spellId: number
    bonusListId: number
}

export interface AzeriteItem {
    azeriteLevel: number
    azeriteExperience: number
    azeriteExperienceRemaining: number
}