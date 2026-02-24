import { Hero, Rarity, Monster, HeroClass, Pet, MonsterType } from './types';

export const MONSTER_TEMPLATES = [
  { name: '森林史莱姆' },
  { name: '岩石巨像' },
  { name: '暗影潜伏者' },
  { name: '邪恶哥布林' },
  { name: '骷髅剑士' },
  { name: '荒野兽人' },
  { name: '洞穴巨魔' },
  { name: '炼狱恶魔' },
  { name: '远古巨龙' },
];

export function generateMonster(stage: number): Monster {
  const isBoss = stage % 50 === 0;
  const isElite = !isBoss && stage % 10 === 0;
  const type = isBoss ? MonsterType.BOSS : (isElite ? MonsterType.ELITE : MonsterType.NORMAL);
  
  const template = MONSTER_TEMPLATES[Math.floor(Math.random() * MONSTER_TEMPLATES.length)];
  const multiplier = 1 + (stage * 0.1);
  const typeMultiplier = isBoss ? 5 : (isElite ? 2 : 1);

  const baseStats = {
    hp: 50 * multiplier * typeMultiplier,
    atk: 10 * multiplier * typeMultiplier,
    def: 5 * multiplier * typeMultiplier,
    spd: 5 + (stage * 0.2),
    skill: 5 * multiplier * typeMultiplier,
  };

  return {
    id: `m-${stage}-${Math.random().toString(36).substr(2, 5)}`,
    name: `${isBoss ? '【首领】' : (isElite ? '【精英】' : '')}${template.name}`,
    level: stage,
    type,
    stats: {
      ...baseStats,
      maxHp: baseStats.hp,
    },
    rewards: {
      gold: Math.floor(20 * multiplier * typeMultiplier),
      gems: Math.floor(2 * multiplier * typeMultiplier),
      exp: Math.floor(20 * multiplier * typeMultiplier),
    }
  };
}

export const HERO_NAMES = [
  "艾琳", "索恩", "莉莉丝", "卡尔", "希尔瓦", "格罗姆", "尤娜", "凯恩", "米拉", "雷加"
];

export const PET_TEMPLATES: Omit<Pet, 'id'>[] = [
  { name: "布丁", type: "猫", icon: "🐱", rarity: Rarity.C, bonus: { atk: 5 }, reaction: "喵呜~ 它蹭了蹭你的手，感觉力量增加了！" },
  { name: "旺财", type: "狗", icon: "🐶", rarity: Rarity.C, bonus: { hp: 50 }, reaction: "汪汪！它兴奋地摇着尾巴，让你感到充满活力。" },
  { name: "波利", type: "史莱姆", icon: "💧", rarity: Rarity.C, bonus: { def: 5 }, reaction: "咕噜咕噜... 它软绵绵地包裹住你的手臂，像一层护甲。" },
  { name: "团子", type: "仓鼠", icon: "🐹", rarity: Rarity.B, bonus: { spd: 10 }, reaction: "吱吱！它在你肩头飞快跑动，你的动作变快了。" },
  { name: "小青", type: "蛇", icon: "🐍", rarity: Rarity.B, bonus: { skill: 15 }, reaction: "嘶嘶... 它缠绕在你的法杖上，魔力流转更加顺畅。" },
  { name: "彩蝶", type: "蝴蝶", icon: "🦋", rarity: Rarity.A, bonus: { skill: 30, spd: 5 }, reaction: "翩翩起舞... 磷粉落在你身上，灵感不断涌现。" },
  { name: "九尾", type: "狐狸", icon: "🦊", rarity: Rarity.S, bonus: { atk: 50, hp: 200 }, reaction: "幽火缭绕... 远古的力量在血管中沸腾！" },
];

export const INTERACTION_ITEMS = [
  { id: 'item1', name: '精致点心', price: 100, affection: 10, description: '美味的点心，能提升英雄的好感度。' },
  { id: 'item2', name: '魔法花束', price: 300, affection: 35, description: '散发着魔力的花束，深受英雄喜爱。' },
  { id: 'item3', name: '传奇饰品', price: 1000, affection: 150, description: '极其珍贵的饰品，能大幅提升好感度。' },
];
