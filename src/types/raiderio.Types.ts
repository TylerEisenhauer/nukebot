export interface RaiderIOCharacterData {
  name: string
  race: string
  class: string
  active_spec_name: string
  active_spec_role: string
  gender: string
  faction: string
  achievement_points: number
  honorable_kills: number
  thumbnail_url: string
  region: string
  realm: string
  profile_url: string
  profile_banner: string
  mythic_plus_best_runs: DungeonRun[]
  mythic_plus_scores_by_season: ScoreBySeason
}

export interface DungeonRun {
  dungeon: string
  short_name: string
  mythic_level: number
  completed_at: string
  clear_time_ms: number
  num_keystone_upgrades: number
  map_challenge_mode_id: number
  score: number
  affixes: Affix[]
}

export interface Affix {
  id: number
  name: string
  description: string
  wowhead_url: string
}

export interface ScoreBySeason {
  season: string
  scores: Score[]
}

export interface Score {
  all: number
  dps: number
  healer: number
  tank: number
  spec_0: number
  spec_1: number
  spec_2: number
  spec_3: number
}