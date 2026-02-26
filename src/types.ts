export enum GameState {
  LOBBY = 'LOBBY',
  GACHA = 'GACHA',
  PET_GACHA = 'PET_GACHA',
  BATTLE = 'BATTLE',
  COLLECTION = 'COLLECTION',
  INTERACTION = 'INTERACTION',
  GENDER_SELECT = 'GENDER_SELECT',
  PRISON = 'PRISON',
  SHOP = 'SHOP',
  OFFSPRING_TRAINING = 'OFFSPRING_TRAINING'
}

export enum MentalState {
  NORMAL = '正常',
  BREAKDOWN = '崩溃'
}

export enum BodyPart {
  FACE = '脸部',
  NIPPLES = '乳头',
  WAIST = '腰部',
  CHEST = '胸口',
  VAGINA = '小穴',
  CLITORIS = '阴蒂',
  ANUS = '屁眼',
  PENIS = '肉棒'
}

export enum Rarity {
  C = 'C',
  B = 'B',
  A = 'A',
  S = 'S',
  SS = 'SS',
  SSS = 'SSS'
}

export enum Race {
  HUMAN = '人族',
  ELF = '精灵',
  ANGEL = '天使',
  DEMON = '恶魔',
  MERMAID = '人鱼',
  VAMPIRE = '吸血鬼',
  FOX = '狐妖',
  CAT = '猫妖'
}

export interface Bloodline {
  race: Race;
  purity: number; // 0-100
}

export enum HeroClass {
  MAGE = '法师',
  SWORDSMAN = '剑士',
  HEALER = '治疗'
}

export enum Gender {
  MALE = '男',
  FEMALE = '女',
  NON_BINARY = '双性'
}

export enum MonsterType {
  NORMAL = '普通',
  ELITE = '精英',
  BOSS = '首领'
}

export interface Stats {
  hp: number;
  maxHp: number;
  atk: number;
  def: number;
  spd: number;
  skill: number;
}

export interface Hero {
  id: string;
  name: string;
  rarity: Rarity;
  class: HeroClass;
  gender: Gender;
  race: Race;
  bloodlines: Bloodline[];
  level: number;
  exp: number;
  maxExp: number;
  stats: Stats;
  description: string;
  rating: number;
  affection: number;
  equippedPetId?: string | null;
  isBreeding?: boolean;
  breedingEndTime?: number;
  breedingCooldownEnd?: number;
  pregnancyAttempts?: number;
  isLocked?: boolean;
  isPinned?: boolean;
  isBreakthroughRequired?: boolean;
  parents?: string[];
  grandparents?: string[];
}

export interface Offspring extends Hero {
  isAdult: boolean;
  trainingCount: number;
  motherId: string;
  fatherId?: string;
  isPrisonOrigin?: boolean;
}

export interface InventoryItem {
  id: string;
  name: string;
  count: number;
  type: 'POTION_SPEED' | 'POTION_COOLDOWN' | 'TRAINING_BOOK';
}

export interface Prisoner {
  id: string;
  name: string;
  gender: Gender;
  class: HeroClass;
  rarity: Rarity;
  race: Race;
  bloodlines: Bloodline[];
  will: number; // 0-100, 0 means can be persuaded
  stats: Stats;
  affection: number;
  isLocked?: boolean;
  consecutivePregnancies?: number;
  mentalState?: MentalState;
  isPregnant?: boolean;
  pregnancyEndTime?: number;
  pregnancyAttempts?: number;
}

export interface Monster {
  id: string;
  name: string;
  stats: Stats;
  level: number;
  type: MonsterType;
  rewards: {
    gold: number;
    gems: number;
    exp: number;
  };
}

export interface Pet {
  id: string;
  name: string;
  type: string;
  icon: string;
  rarity: Rarity;
  bonus: Partial<Stats>;
  reaction: string;
}

export interface Player {
  name: string;
  gender: Gender;
  gold: number;
  gems: number;
  exp: number;
  level: number;
  currentStage: number; // This will now represent "Difficulty"
  currentSubStage: number; // 1-11
  clearedEliteStages: string[]; // "difficulty-substage"
  collection: Hero[];
  petCollection: Pet[];
  prisoners: Prisoner[];
  activeHeroId: string | null;
  activePetId: string | null;
  pityCount: number;
  targetRace: Race;
  bloodlines: Bloodline[];
  offsprings: Offspring[];
  inventory: InventoryItem[];
}
