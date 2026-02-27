import { Rarity, Stats, Bloodline } from '../types';

export const BASE_STATS_MAP = {
  [Rarity.C]: { min: 10, max: 30 },
  [Rarity.B]: { min: 30, max: 60 },
  [Rarity.A]: { min: 60, max: 100 },
  [Rarity.S]: { min: 100, max: 200 },
  [Rarity.SS]: { min: 200, max: 400 },
  [Rarity.SSS]: { min: 400, max: 800 },
  [Rarity.SP]: { min: 800, max: 1500 },
};

export const RARITY_MULTIPLIER = {
  [Rarity.C]: 1.0,
  [Rarity.B]: 1.1,
  [Rarity.A]: 1.2,
  [Rarity.S]: 1.5,
  [Rarity.SS]: 2.0,
  [Rarity.SSS]: 3.0,
  [Rarity.SP]: 5.0,
};

export function calculateRating(stats: Stats, rarity: Rarity, bloodlines: Bloodline[]): number {
  const baseRating = (stats.hp / 5) + stats.atk + stats.def + stats.spd + stats.skill;
  const rarityMult = RARITY_MULTIPLIER[rarity];
  
  // Bloodline bonus: up to 50% extra for 100% purity
  const maxPurity = Math.max(...bloodlines.map(b => b.purity), 0);
  const bloodlineMult = 1 + (maxPurity / 100) * 0.5;
  
  return Math.floor(baseRating * rarityMult * bloodlineMult);
}

export function generateBaseStats(rarity: Rarity): Stats {
  const range = BASE_STATS_MAP[rarity];
  const stats: Stats = {
    hp: Math.floor(Math.random() * (range.max - range.min) + range.min) * 5,
    maxHp: 0,
    atk: Math.floor(Math.random() * (range.max - range.min) + range.min),
    def: Math.floor(Math.random() * (range.max - range.min) + range.min) / 2,
    spd: Math.floor(Math.random() * 20) + 5,
    skill: Math.floor(Math.random() * (range.max - range.min) + range.min),
  };
  stats.maxHp = stats.hp;
  return stats;
}
