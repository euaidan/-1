import { Hero, Rarity, Monster, HeroClass, Pet, MonsterType, BodyPart } from './types';

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

export function generateMonster(difficulty: number, subStage: number): Monster {
  const isBoss = difficulty % 5 === 0 && subStage === 11;
  const isElite = !isBoss && subStage === 11;
  const type = isBoss ? MonsterType.BOSS : (isElite ? MonsterType.ELITE : MonsterType.NORMAL);
  
  const template = MONSTER_TEMPLATES[Math.floor(Math.random() * MONSTER_TEMPLATES.length)];
  const multiplier = 1 + (difficulty * 0.35) + (subStage * 0.05);
  const typeMultiplier = isBoss ? 8 : (isElite ? 3 : 1);

  const baseStats = {
    hp: 50 * multiplier * typeMultiplier,
    atk: 10 * multiplier * typeMultiplier,
    def: 0,
    spd: 5 + (difficulty * 0.5) + (subStage * 0.1),
    skill: 5 * multiplier * typeMultiplier,
  };

  return {
    id: `m-${difficulty}-${subStage}-${Math.random().toString(36).substr(2, 5)}`,
    name: `${isBoss ? '【首领】' : (isElite ? '【精英】' : '')}${template.name}`,
    level: difficulty,
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
  "艾琳", "索恩", "莉莉丝", "卡尔", "希尔瓦", "格罗姆", "尤娜", "凯恩", "米拉", "雷加",
  "赛琳娜", "奥瑞恩", "芙蕾雅", "巴尔德", "赫尔墨斯", "雅典娜", "阿波罗", "阿尔忒弥斯", "波塞冬", "宙斯",
  "克洛伊", "诺亚", "伊莎贝尔", "卢卡斯", "索菲亚", "奥利弗", "艾玛", "伊森", "米娅", "利奥",
  "维多利亚", "亚历山大", "斯嘉丽", "塞巴斯蒂安", "佩内洛普", "杰克", "露露", "哈利", "贝拉", "查理",
  "娜塔莎", "布鲁斯", "戴安娜", "克拉克", "亚瑟", "巴里", "维克多", "哈莉", "帕克", "托尼"
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

export const CHAT_TEXTS = [
  "“今天的天气真不错，想和你一起去散步...”",
  "“你觉得我穿这身衣服好看吗？”",
  "“如果你愿意的话，我希望能一直陪在你身边。”",
  "“我一直在想，如果我们能有一个属于自己的家...”",
  "“你是我在这个世界上最信任的人。”"
];

export const BREEDING_CHAT_TEXTS = [
  "“我...我希望能为你诞下最优秀的后代。”",
  "“如果有了孩子，你希望他长得像谁？”",
  "“我会努力成为一个好母亲的...”",
  "“我们的血脉，一定会延续下去。”",
  "“只要是为了你，我什么都愿意做。”"
];

export const BREAKDOWN_TEXTS = [
  "“杀了我...求求你杀了我...”",
  "“你这个恶魔！你会下地狱的！”",
  "“为什么...为什么要这样对我...”",
  "“我已经...什么都没有了...”",
  "“离我远点！不要碰我！”"
];

export const SUICIDE_TEXTS = [
  "囚犯在绝望中咬舌自尽了。",
  "囚犯趁守卫不注意，撞墙而亡。",
  "囚犯用破碎的碗片割开了喉咙。",
  "囚犯在深夜里停止了呼吸，脸上带着解脱的微笑。",
  "囚犯的心脏在无尽的折磨中停止了跳动。"
];

export const PUNISHMENT_TEXTS: Record<BodyPart, string[]> = {
  [BodyPart.FACE]: [
    "你用力捏住她的下巴，在她的脸上留下了红印，她屈辱地闭上了眼。",
    "你轻佻地拍打着她的脸颊，看着她愤怒却又无可奈何的样子。",
    "你用冰冷的金属片在她的脸上游走，划出一道道浅浅的白痕，她惊恐地缩着脖子。",
    "你强迫她直视你的眼睛，在她的瞳孔中欣赏自己卑微的倒影。"
  ],
  [BodyPart.NIPPLES]: [
    "你粗暴地揉搓着那两点嫣红，她发出了压抑的娇喘声。",
    "冰冷的指尖划过敏感的顶端，她不由自主地颤抖起来。",
    "你用细长的银针轻轻拨弄着，带起阵阵酥麻与刺痛，她咬紧牙关不让自己叫出声。",
    "你将滚烫的蜡油滴在那处，看着它迅速变红，她疼得弓起了背。"
  ],
  [BodyPart.WAIST]: [
    "你紧紧搂住她纤细的腰肢，感受着她惊慌失措的挣扎。",
    "你在她腰间的软肉上用力一掐，她疼得眼角泛起了泪花。",
    "你用粗糙的麻绳将她的腰部紧紧勒住，勒出深深的痕迹，她呼吸变得急促而困难。",
    "你的手掌在她的腰侧不断游移，带起一阵阵让她战栗的触感。"
  ],
  [BodyPart.CHEST]: [
    "你肆意玩弄着那对丰盈，感受着它们在手中变换形状。",
    "你将头埋入那片柔软之中，贪婪地嗅着她身上的香气。",
    "你用冰冷的铁链横过她的胸前，沉重的压力让她感到窒息，却又带起异样的快感。",
    "你用羽毛轻轻扫过那片雪白，看着她因为敏感而泛起的红晕。"
  ],
  [BodyPart.VAGINA]: [
    "你的手指强行闯入了那片泥泞，她发出了高亢的尖叫。",
    "你用粗糙的器具折磨着那处秘境，汁液顺着大腿流了下来。",
    "你将冰块塞入那处温热，极端的温差让她发出了破碎的呻吟，身体剧烈地抽搐着。",
    "你恶意地撑开那处，欣赏着里面因为充血而变得鲜艳的内壁。"
  ],
  [BodyPart.CLITORIS]: [
    "你恶意地拨弄着那颗充血的小核，她敏感地蜷缩起了身体。",
    "持续的刺激让她几乎失去了理智，只能发出破碎的呻吟。",
    "你用震动的器具抵住那处，强烈的频率让她瞬间攀上了虚假的巅峰，随后是更深的空虚。",
    "你用指甲轻轻刮过，带起一阵阵让她几乎昏厥的电流。"
  ],
  [BodyPart.ANUS]: [
    "你毫不留情地侵犯了那处禁地，她疼得几乎昏厥过去。",
    "你看着那处紧闭的入口在折磨下变得红肿，心中充满了快感。",
    "你强行塞入巨大的异物，看着那处被撑到极限，她痛苦地抓紧了身下的床单。",
    "你用冰冷的药液灌入，看着她因为腹部的胀痛而痛苦地扭动。"
  ],
  [BodyPart.PENIS]: [
    "你粗暴地撸动着那根充血的肉棒，看着他因为快感与羞耻而扭曲的面孔。",
    "你用细绳勒住冠状沟，看着顶端因为充血而变得紫红，他发出痛苦的闷哼。",
    "你恶意地用冰冷的金属环套在根部，限制着血液的流动，让他感受到持续的胀痛。",
    "你用指甲划过敏感的马眼，看着他因为极端的刺激而全身痉挛。"
  ]
};
