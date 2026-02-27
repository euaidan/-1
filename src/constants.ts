import { Hero, Rarity, Monster, HeroClass, Pet, MonsterType, BodyPart, Race, Gender } from '@/types';

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

export function generateMonster(chapter: number, level: number): Monster {
  const isBoss = level === 10;
  const isElite = level === 5;
  const type = isBoss ? MonsterType.BOSS : (isElite ? MonsterType.ELITE : MonsterType.NORMAL);
  
  const template = MONSTER_TEMPLATES[Math.floor(Math.random() * MONSTER_TEMPLATES.length)];
  // Balance optimization: smoother progression
  const multiplier = Math.pow(1.2, chapter - 1) * (1 + (level - 1) * 0.1);
  const typeMultiplier = isBoss ? 5 : (isElite ? 2.5 : 1);

  const baseStats = {
    hp: Math.floor(100 * multiplier * typeMultiplier),
    atk: Math.floor(20 * multiplier * typeMultiplier),
    def: Math.floor(5 * multiplier * typeMultiplier),
    spd: Math.floor(10 + (chapter * 0.5) + (level * 0.2)),
    skill: Math.floor(15 * multiplier * typeMultiplier),
  };

  return {
    id: `m-${chapter}-${level}-${Math.random().toString(36).substr(2, 5)}`,
    name: `${isBoss ? '【首领】' : (isElite ? '【精英】' : '')}${template.name}`,
    level: chapter,
    type,
    stats: {
      ...baseStats,
      maxHp: baseStats.hp,
    },
    rewards: {
      gold: Math.floor(50 * multiplier * typeMultiplier),
      gems: Math.floor(5 * multiplier * typeMultiplier),
      exp: Math.floor(50 * multiplier * typeMultiplier),
    }
  };
}

export const HERO_NAMES = [
  "艾琳", "索恩", "卡尔", "希尔瓦", "格罗姆", "尤娜", "凯恩", "米拉", "雷加",
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

export const FIXED_HEROES = [
  // HUMAN
  { race: Race.HUMAN, rarity: Rarity.SSS, gender: Gender.MALE, name: "轩辕", description: "人族始祖，手持黄金圣剑，统领万民。他的剑光所到之处，妖邪尽散。" },
  { race: Race.HUMAN, rarity: Rarity.SSS, gender: Gender.FEMALE, name: "瑶姬", description: "人族圣女，拥有治愈万物的神圣力量。他是无数战士心中的希望之光。" },
  { race: Race.HUMAN, rarity: Rarity.SP, gender: Gender.MALE, name: "盘古", description: "开天辟地的始源之神，人族之力的终极体现。他的呼吸化为风雷，双眼化为日月。" },
  { race: Race.HUMAN, rarity: Rarity.SP, gender: Gender.FEMALE, name: "女娲", description: "造人补天的创世女神，掌握着生命的至高法则。他用五彩石修补苍天，守护众生。" },
  // ELF
  { race: Race.ELF, rarity: Rarity.SSS, gender: Gender.MALE, name: "埃隆", description: "精灵王国的守护者，箭术通神。他能在千步之外射中飘落的叶片。" },
  { race: Race.ELF, rarity: Rarity.SSS, gender: Gender.FEMALE, name: "露西尔", description: "月光下的吟游诗人，他的歌声能让森林中的万物复苏。" },
  { race: Race.ELF, rarity: Rarity.SP, gender: Gender.MALE, name: "塞纳留斯", description: "森林之子，半神之躯。他是大自然意志的化身，统领着荒野的力量。" },
  { race: Race.ELF, rarity: Rarity.SP, gender: Gender.FEMALE, name: "艾露恩", description: "月亮女神，精灵族的信仰核心。他的光辉照耀着每一个迷途的灵魂。" },
  // ANGEL
  { race: Race.ANGEL, rarity: Rarity.SSS, gender: Gender.MALE, name: "米迦勒", description: "天界大天使长，正义的化身。他手持烈焰长剑，审判世间一切罪恶。" },
  { race: Race.ANGEL, rarity: Rarity.SSS, gender: Gender.FEMALE, name: "加百列", description: "神之信使，拥有最纯净的圣光。他的羽翼能净化世间所有的污秽。" },
  { race: Race.ANGEL, rarity: Rarity.SP, gender: Gender.MALE, name: "路西法", description: "曾经的晨曦之星，坠落后的傲慢之主。即便身处地狱，依然保持着神性的光辉。" },
  { race: Race.ANGEL, rarity: Rarity.SP, gender: Gender.FEMALE, name: "拉斐尔", description: "治愈大天使，掌握着生命的奥秘。他的泪水能让死者复生，伤者痊愈。" },
  // DEMON
  { race: Race.DEMON, rarity: Rarity.SSS, gender: Gender.MALE, name: "巴尔", description: "魔界至尊，统领七十二柱魔神。他的咆哮能让大地崩裂，天空变色。" },
  { race: Race.DEMON, rarity: Rarity.SSS, gender: Gender.FEMALE, name: "莉莉丝", description: "魅魔之母，拥有极致的诱惑力。他的眼神能让最坚定的勇者沦为奴隶。" },
  { race: Race.DEMON, rarity: Rarity.SP, gender: Gender.MALE, name: "撒旦", description: "地狱的真正主宰，邪恶的源头。他代表着绝对的毁灭与混乱。" },
  { race: Race.DEMON, rarity: Rarity.SP, gender: Gender.FEMALE, name: "海拉", description: "冥界女王，掌控着死亡的权柄。在他的领域，生命不过是转瞬即逝的幻影。" },
  // MERMAID
  { race: Race.MERMAID, rarity: Rarity.SSS, gender: Gender.MALE, name: "波塞冬", description: "深海之王，三叉戟的持有者。他的一怒能引发滔天巨浪，吞没一切文明。" },
  { race: Race.MERMAID, rarity: Rarity.SSS, gender: Gender.FEMALE, name: "阿芙洛", description: "海洋的明珠，美与爱的化身。他的歌声能让狂暴的海兽变得温顺。" },
  { race: Race.MERMAID, rarity: Rarity.SP, gender: Gender.MALE, name: "利维坦", description: "远古海怪之首，体型足以环绕世界。他是深海中不可名状的恐惧。" },
  { race: Race.MERMAID, rarity: Rarity.SP, gender: Gender.FEMALE, name: "忒提斯", description: "海洋女神，预言的掌控者。他能从海浪的起伏中洞察未来的走向。" },
  // VAMPIRE
  { race: Race.VAMPIRE, rarity: Rarity.SSS, gender: Gender.MALE, name: "德古拉", description: "吸血鬼始祖，暗夜的伯爵。他在城堡中沉睡千年，等待着鲜血的祭礼。" },
  { race: Race.VAMPIRE, rarity: Rarity.SSS, gender: Gender.FEMALE, name: "卡蜜拉", description: "血色玫瑰，优雅而致命。他的舞步在月光下旋转，收割着迷途者的生命。" },
  { race: Race.VAMPIRE, rarity: Rarity.SP, gender: Gender.MALE, name: "该隐", description: "被诅咒的始祖，永生不死的流浪者。他背负着原罪，行走在光影之间。" },
  { race: Race.VAMPIRE, rarity: Rarity.SP, gender: Gender.FEMALE, name: "伊丽莎白", description: "鲜血女王，用少女的鲜血保持永恒的青春。他的美貌建立在无尽的痛苦之上。" },
  // FOX
  { race: Race.FOX, rarity: Rarity.SSS, gender: Gender.MALE, name: "白辰", description: "九尾狐族的智者，幻术大师。他能随手创造出让人沉溺其中的梦境。" },
  { race: Race.FOX, rarity: Rarity.SSS, gender: Gender.FEMALE, name: "苏妲己", description: "倾国倾城的妖狐，祸乱众生的红颜。他的魅力足以让一个帝国走向毁灭。" },
  { race: Race.FOX, rarity: Rarity.SP, gender: Gender.MALE, name: "玉藻前", description: "拥有九条尾巴的绝世妖狐，神力通天。他是狐族中唯一能与神明抗衡的存在。" },
  { race: Race.FOX, rarity: Rarity.SP, gender: Gender.FEMALE, name: "涂山红红", description: "涂山之主，绝世妖盟盟主。他的力量源于守护，是狐族最坚强的后盾。" },
  // CAT
  { race: Race.CAT, rarity: Rarity.SSS, gender: Gender.MALE, name: "巴斯特", description: "猫神殿的守护者，敏捷的化身。他在黑暗中穿梭，无人能捕捉其踪迹。" },
  { race: Race.CAT, rarity: Rarity.SSS, gender: Gender.FEMALE, name: "贝斯特", description: "丰饶与喜乐之神，猫族的骄傲。他的出现总是伴随着好运与欢笑。" },
  { race: Race.CAT, rarity: Rarity.SP, gender: Gender.MALE, name: "明月", description: "诞生于极北之地的万年冰月之下，他是黑夜中唯一的清冷。其步履无声，能行走于梦境与现实的边缘，凡见其真容者，皆如坠入永恒的幻梦。" },
  { race: Race.CAT, rarity: Rarity.SP, gender: Gender.FEMALE, name: "昭华", description: "他是晨曦初露时那一抹最绚烂的霞光，亦是猫族禁地中沉睡万载的古老意志。他的双瞳映照着诸神的黄昏，指尖流转着足以重塑因果的神秘灵力。" },
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
  "“你是我在这个世界上最信任的人。”",
  "“有时候我会梦见我们未来的样子，那一定很幸福。”",
  "“只要能看到你的笑容，我就觉得一切努力都是值得的。”",
  "“你会永远记得我吗？即使有一天我老去了...”"
];

export const SP_CHAT_TEXTS = [
  "“作为SP级的存在，我所背负的宿命...唯有你能与我共担。”",
  "“这股禁忌的力量，在你的引导下似乎变得温柔了许多。”",
  "“众神在低语，但我只听从你的指令，我的主宰。”",
  "“跨越千年的等待，只为在这一刻与你相遇。”",
  "“我的灵魂早已刻上了你的烙印，永世不灭。”"
];

export const SP_DESCRIPTIONS = [
  "拥有神格碎片的禁忌存在，其实力足以颠覆因果。",
  "从虚空裂缝中诞生的异界主宰，其存在本身就是一种奇迹。",
  "背负着灭世预言的圣女，唯有真爱能平息他内心的狂气。",
  "统领万妖的至尊狐皇，其一颦一笑皆能勾魂夺魄。",
  "坠落凡尘的炽天使，即便羽翼染黑，依然保持着高傲的姿态。"
];

export const BREEDING_CHAT_TEXTS = [
  "“我...我希望能为你诞下最优秀的后代。”",
  "“如果有了孩子，你希望他长得像谁？”",
  "“我会努力成为一个好母亲的...”",
  "“我们的血脉，一定会延续下去。”",
  "“只要是为了你，我什么都愿意做。”",
  "“感受到了吗？那是我们血脉交融的律动...”",
  "“无论要经历多少次，我都愿意为你承受这份痛苦与喜悦。”"
];

export const PRISON_INTERACTION_TEXTS = [
  "“求求你...放过我吧，我愿意做任何事...”",
  "“这种屈辱...我一辈子都不会忘记的！”",
  "“别碰那里...求你了，那里不行...”",
  "“你以为这样就能征服我吗？做梦！”",
  "“身体...已经变得奇怪了...救救我...”",
  "“为什么...为什么我会觉得这种痛苦...很舒服？”",
  "“你的眼神...让我感到害怕，却又让我无法移开视线。”",
  "“求你...再多给我一点...那种感觉...”"
];

export const BREAKDOWN_TEXTS = [
  "“杀了我...求求你杀了我...”",
  "“你这个恶魔！你会下地狱的！”",
  "“为什么...为什么要这样对我...”",
  "“我已经...什么都没有了...”",
  "“离我远点！不要碰我！”",
  "“嘿嘿...嘿嘿嘿...大家都在笑，你看到了吗？”",
  "“坏掉了...我已经彻底坏掉了...”",
  "“黑暗...到处都是黑暗...好冷...”"
];

export const BREAKDOWN_PUNISHMENT_TEXTS = [
  "囚犯发出了毫无意义的痴笑，口水顺着嘴角流下，对你的折磨毫无反应。",
  "他空洞的双眼直勾勾地盯着虚空，任由你摆布，仿佛灵魂已经离开了这具躯壳。",
  "“嘿嘿...再多来一点...坏掉的感觉...好棒...”他发出了令人毛骨悚然的低语。",
  "囚犯的身体剧烈抽搐着，却发出了扭曲的笑声，精神已经彻底崩坏。",
  "他像木偶一样一动不动，无论你如何羞辱，都再也无法从他眼中看到一丝神采。",
  "“坏掉了...全部都坏掉了...呵呵呵...”他不断重复着这句话，陷入了永恒的疯狂。"
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
    "你用力捏住他的下巴，在他的脸上留下了红印，他屈辱地闭上了眼。",
    "你轻佻地拍打着他的脸颊，看着他愤怒却又无可奈何的样子。",
    "你用冰冷的金属片在他的脸上游走，划出一道道浅浅的白痕，他惊恐地缩着脖子。",
    "你强迫他直视你的眼睛，在他的瞳孔中欣赏自己卑微的倒影。"
  ],
  [BodyPart.NIPPLES]: [
    "你粗暴地揉搓着那两点嫣红，他发出了压抑的娇喘声。",
    "冰冷的指尖划过敏感的顶端，他不由自主地颤抖起来。",
    "你用细长的银针轻轻拨弄着，带起阵阵酥麻与刺痛，他咬紧牙关不让自己叫出声。",
    "你将滚烫的蜡油滴在那处，看着它迅速变红，他疼得弓起了背。"
  ],
  [BodyPart.WAIST]: [
    "你紧紧搂住他纤细的腰肢，感受着他惊慌失措的挣扎。",
    "你在他腰间的软肉上用力一掐，他疼得眼角泛起了泪花。",
    "你用粗糙的麻绳将他的腰部紧紧勒住，勒出深深的痕迹，他呼吸变得急促而困难。",
    "你的手掌在他的腰侧不断游移，带起一阵阵让他战栗的触感。"
  ],
  [BodyPart.CHEST]: [
    "你肆意玩弄着那对丰盈，感受着它们在手中变换形状。",
    "你将头埋入那片柔软之中，贪婪地嗅着他身上的香气。",
    "你用冰冷的铁链横过他的胸前，沉重的压力让他感到窒息，却又带起异样的快感。",
    "你用羽毛轻轻扫过那片雪白，看着他因为敏感而泛起的红晕。"
  ],
  [BodyPart.VAGINA]: [
    "你的手指强行闯入了那片泥泞，他发出了高亢的尖叫。",
    "你用粗糙的器具折磨着那处秘境，汁液顺着大腿流了下来。",
    "你将冰块塞入那处温热，极端的温差让他发出了破碎的呻吟，身体剧烈地抽搐着。",
    "你恶意地撑开那处，欣赏着里面因为充血而变得鲜艳的内壁。"
  ],
  [BodyPart.CLITORIS]: [
    "你恶意地拨弄着那颗充血的小核，他敏感地蜷缩起了身体。",
    "持续的刺激让他几乎失去了理智，只能发出破碎的呻吟。",
    "你用震动的器具抵住那处，强烈的频率让他瞬间攀上了虚假的巅峰，随后是更深的空虚。",
    "你用指甲轻轻刮过，带起一阵阵让他几乎昏厥的电流。"
  ],
  [BodyPart.ANUS]: [
    "你毫不留情地侵犯了那处禁地，他疼得几乎昏厥过去。",
    "你看着那处紧闭的入口在折磨下变得红肿，心中充满了快感。",
    "你强行塞入巨大的异物，看着那处被撑到极限，他痛苦地抓紧了身下的床单。",
    "你用冰冷的药液灌入，看着他因为腹部的胀痛而痛苦地扭动。"
  ],
  [BodyPart.PENIS]: [
    "你粗暴地撸动着那根充血的肉棒，看着他因为快感与羞耻而扭曲的面孔。",
    "你用细绳勒住冠状沟，看着顶端因为充血而变得紫红，他发出痛苦的闷哼。",
    "你恶意地用冰冷的金属环套在根部，限制着血液的流动，让他感受到持续的胀痛。",
    "你用指甲划过敏感的马眼，看着他因为极端的刺激而全身痉挛。"
  ]
};
