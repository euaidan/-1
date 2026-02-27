/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sword, Sparkles, Trophy, Users, Coins, Gem, ChevronLeft, Play, Info, Save, Upload, Trash2, Database, Settings } from 'lucide-react';
import { GameState, Player, Hero, Monster, Rarity, Gender, HeroClass, Pet, Stats, Prisoner, MonsterType, Race, Bloodline, InventoryItem, Offspring, MentalState, BodyPart } from './types';
import { HERO_NAMES, PET_TEMPLATES, generateMonster, SP_DESCRIPTIONS, FIXED_HEROES } from './constants';
import { cn } from './lib/utils';
import { calculateRating, generateBaseStats } from './lib/gameUtils';

// Components
import Lobby from './components/Lobby';
import GachaScreen from './components/GachaScreen';
import PetGachaScreen from './components/PetGachaScreen';
import BattleScreen from './components/BattleScreen';
import Collection from './components/Collection';
import InteractionScreen from './components/InteractionScreen';
import PrisonScreen from './components/PrisonScreen';
import ShopScreen from './components/ShopScreen';
import OffspringTrainingScreen from './components/OffspringTrainingScreen';
import GalleryScreen from './components/GalleryScreen';
import LevelUpModal from './components/LevelUpModal';
import SettingsModal from './components/SettingsModal';

const INITIAL_PLAYER: Player = {
  name: "新进召唤师",
  gender: Gender.NON_BINARY,
  gold: 1000,
  gems: 200,
  exp: 0,
  level: 1,
  currentStage: 1,
  currentSubStage: 1,
  unlockedChapter: 1,
  unlockedLevel: 1,
  clearedChapters: [],
  clearedEliteStages: [],
  collection: [],
  petCollection: [],
  prisoners: [],
  activeHeroId: null,
  activePetId: null,
  pityCount: 0,
  spPityCount: 0,
  targetRace: Race.ELF,
  bloodlines: [{ race: Race.HUMAN, purity: 100 }],
  offsprings: [],
  inventory: [],
};

export default function App() {
  const [gameState, setGameState] = useState<GameState>(GameState.GENDER_SELECT);
  const [player, setPlayer] = useState<Player>(() => {
    const saved = localStorage.getItem('mythic_summoner_player_v2');
    const parsed = saved ? JSON.parse(saved) : INITIAL_PLAYER;
    
    // Migration for old saves
    const migrateHero = (hero: any): Hero => ({
      ...hero,
      race: hero.race || Race.HUMAN,
      bloodlines: hero.bloodlines || [{ race: Race.HUMAN, purity: 100 }],
    });

    const migratePrisoner = (p: any): Prisoner => ({
      ...p,
      race: p.race || Race.HUMAN,
      bloodlines: p.bloodlines || [{ race: Race.HUMAN, purity: 100 }],
    });

    return {
      ...INITIAL_PLAYER,
      ...parsed,
      collection: (parsed.collection || []).map(migrateHero),
      petCollection: parsed.petCollection || [],
      prisoners: (parsed.prisoners || []).map(migratePrisoner),
      bloodlines: parsed.bloodlines || [{ race: Race.HUMAN, purity: 100 }],
      offsprings: (parsed.offsprings || []).map(migrateHero) as Offspring[],
      inventory: parsed.inventory || [],
      pityCount: parsed.pityCount || 0,
      spPityCount: parsed.spPityCount || 0,
      currentStage: parsed.currentStage || 1,
      currentSubStage: parsed.currentSubStage || 1,
      unlockedChapter: parsed.unlockedChapter || parsed.currentStage || 1,
      unlockedLevel: parsed.unlockedLevel || parsed.currentSubStage || 1,
      clearedChapters: parsed.clearedChapters || [],
      clearedEliteStages: parsed.clearedEliteStages || [],
    };
  });
  const [lastSummoned, setLastSummoned] = useState<Hero[]>([]);
  const [lastSummonedPets, setLastSummonedPets] = useState<Pet[]>([]);
  const [selectedDifficulty, setSelectedDifficulty] = useState(player.currentStage || 1);
  const [selectedOffspringId, setSelectedOffspringId] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [levelUpHeroId, setLevelUpHeroId] = useState<string | null>(null);

  const determineRaceFromBloodlines = useCallback((bloodlines: Bloodline[]): Race => {
    const pure = bloodlines.find(b => b.purity >= 100);
    if (pure) return pure.race;
    
    const roll = Math.random() * 100;
    let cumulative = 0;
    for (const b of bloodlines) {
      cumulative += b.purity;
      if (roll <= cumulative) return b.race;
    }
    return bloodlines[0]?.race || Race.HUMAN;
  }, []);

  // Auto-save
  useEffect(() => {
    localStorage.setItem('mythic_summoner_player_v2', JSON.stringify(player));
  }, [player]);

  useEffect(() => {
    const interval = setInterval(() => {
      setPlayer(prev => {
        let changed = false;
        const now = Date.now();
        const newOffsprings: Offspring[] = [];

        const prisoners = prev.prisoners.map(p => {
          if (p.isPregnant && p.pregnancyEndTime && now >= p.pregnancyEndTime) {
            changed = true;
            // Pregnancy finished - generate offspring
            const weights: Record<Rarity, number> = {
              [Rarity.C]: 1, [Rarity.B]: 2, [Rarity.A]: 5, [Rarity.S]: 15, [Rarity.SS]: 40, [Rarity.SSS]: 100, [Rarity.SP]: 250,
            };
            const parentWeight = weights[p.rarity];
            const roll = Math.random();
            let rarity = Rarity.C;
            if (roll < parentWeight / 1000) rarity = Rarity.SSS;
            else if (roll < parentWeight / 200) rarity = Rarity.SS;
            else if (roll < parentWeight / 50) rarity = Rarity.S;
            else if (roll < parentWeight / 20) rarity = Rarity.A;
            else if (roll < parentWeight / 5) rarity = Rarity.B;

            const stats = generateBaseStats(rarity);
            const offspring: Offspring = {
              id: Math.random().toString(36).substr(2, 9),
              name: `${p.name}之子`,
              rarity,
              class: p.class,
              gender: Math.random() > 0.5 ? Gender.MALE : Gender.FEMALE,
              race: p.race,
              bloodlines: p.bloodlines,
              level: 1,
              exp: 0,
              maxExp: 100,
              stats,
              description: "在囚牢中诞下的后代。",
              rating: calculateRating(stats, rarity, p.bloodlines),
              affection: 30,
              isAdult: false,
              trainingCount: 0,
              motherId: p.id,
              fatherId: 'player',
              isPrisonOrigin: true,
              parents: [p.id, 'player'],
              grandparents: p.bloodlines.map(b => b.race).slice(0, 2) // Simplified
            };
            newOffsprings.push(offspring);
            return { ...p, isPregnant: false, pregnancyEndTime: undefined };
          }
          
          if (p.mentalState === MentalState.BREAKDOWN && Math.random() < 0.01) {
             changed = true;
             return null; // Suicide
          }
          
          return p;
        }).filter(p => p !== null) as Prisoner[];

        if (!changed && newOffsprings.length === 0) return prev;
        return { 
          ...prev, 
          prisoners, 
          offsprings: [...prev.offsprings, ...newOffsprings] 
        };
      });
    }, 60000); // Every minute
    return () => clearInterval(interval);
  }, []);

  // If player already has a gender, skip selection
  useEffect(() => {
    if (player.gender !== Gender.NON_BINARY || player.collection.length > 0) {
      if (gameState === GameState.GENDER_SELECT) {
        setGameState(GameState.LOBBY);
      }
    }
  }, []);

  const renameHero = useCallback((heroId: string, newName: string) => {
    setPlayer(prev => ({
      ...prev,
      collection: prev.collection.map(h => h.id === heroId ? { ...h, name: newName } : h)
    }));
  }, []);

  const updateHeroGender = useCallback((heroId: string, gender: Gender) => {
    setPlayer(prev => ({
      ...prev,
      collection: prev.collection.map(h => h.id === heroId ? { ...h, gender } : h)
    }));
  }, []);

   const updateHeroAffection = useCallback((heroId: string, amount: number) => {
    setPlayer(prev => {
      const update = (list: any[]) => list.map(h => h.id === heroId ? { ...h, affection: Math.max(-10000, Math.min(1000, h.affection + amount)) } : h);
      return {
        ...prev,
        collection: update(prev.collection),
        offsprings: update(prev.offsprings) as Offspring[]
      };
    });
  }, []);

  const updatePlayerStats = useCallback((updates: Partial<Player>) => {
    setPlayer(prev => ({ ...prev, ...updates }));
  }, []);

  const handleSummon = useCallback((count: number, targetRace: Race) => {
    const cost = count === 1 ? 100 : 900;
    if (player.gems < cost) return false;

    const newHeroes: Hero[] = [];
    let newPityCount = player.pityCount;
    let newSpPityCount = player.spPityCount;

    for (let i = 0; i < count; i++) {
      newPityCount++;
      newSpPityCount++;
      const rarityRoll = Math.random();
      let rarity = Rarity.C;
      let race = Race.HUMAN;
      let bloodlines: Bloodline[] = [{ race: Race.HUMAN, purity: 100 }];

      // SP Pure Blood Check (0.05% or Pity 200)
      if (rarityRoll < 0.0005 || newSpPityCount >= 200) {
        rarity = Rarity.SP;
        race = targetRace;
        bloodlines = [{ race: targetRace, purity: 100 }];
        newSpPityCount = 0;
      } else if (rarityRoll < 0.005 || newPityCount >= 100) {
        rarity = Rarity.SSS;
        race = targetRace;
        bloodlines = [{ race: targetRace, purity: 100 }];
        newPityCount = 0;
      } else {
        // Normal Rarity Roll
        const r = Math.random();
        if (r < 0.01) rarity = Rarity.SS;
        else if (r < 0.05) rarity = Rarity.S;
        else if (r < 0.2) rarity = Rarity.A;
        else if (r < 0.5) rarity = Rarity.B;
        else rarity = Rarity.C;

        // Random bloodline for gacha (can be higher than 40% but not pure unless SSS)
        if (Math.random() < 0.3) {
          const specialRace = Object.values(Race).filter(r => r !== Race.HUMAN)[Math.floor(Math.random() * 7)];
          const purity = Math.floor(Math.random() * 80) + 10;
          bloodlines = [
            { race: specialRace, purity },
            { race: Race.HUMAN, purity: 100 - purity }
          ];
          race = determineRaceFromBloodlines(bloodlines);
        }
      }

      const classes = [HeroClass.MAGE, HeroClass.SWORDSMAN, HeroClass.HEALER];
      const hClass = classes[Math.floor(Math.random() * classes.length)];
      const genders = [Gender.MALE, Gender.FEMALE, Gender.NON_BINARY];
      
      const stats = generateBaseStats(rarity);
      let name = HERO_NAMES[Math.floor(Math.random() * HERO_NAMES.length)];
      let description = rarity === Rarity.SP 
        ? SP_DESCRIPTIONS[Math.floor(Math.random() * SP_DESCRIPTIONS.length)]
        : `一位来自${race}的英雄。`;
      let finalGender = genders[Math.floor(Math.random() * genders.length)];
      let isFixed = false;

      // Fixed Heroes for SSS and SP
      if (rarity === Rarity.SSS || rarity === Rarity.SP) {
        const fixedPool = FIXED_HEROES.filter(h => h.race === race && h.rarity === rarity);
        if (fixedPool.length > 0) {
          const fixed = fixedPool[Math.floor(Math.random() * fixedPool.length)];
          name = fixed.name;
          description = fixed.description;
          finalGender = fixed.gender;
          isFixed = true;
        }
      }

      const newHero: Hero = {
        id: Math.random().toString(36).substr(2, 9),
        name,
        rarity,
        class: hClass,
        gender: finalGender,
        race,
        bloodlines,
        level: 1,
        exp: 0,
        maxExp: 100,
        stats,
        description,
        rating: calculateRating(stats, rarity, bloodlines),
        affection: 0,
        isFixed
      };
      newHeroes.push(newHero);
    }

    setPlayer(prev => ({
      ...prev,
      gems: prev.gems - cost,
      collection: [...prev.collection, ...newHeroes],
      activeHeroId: prev.activeHeroId || newHeroes[0].id,
      pityCount: newPityCount,
      spPityCount: newSpPityCount,
      targetRace
    }));
    setLastSummoned(newHeroes);
    return true;
  }, [player.gems, player.pityCount, player.spPityCount, determineRaceFromBloodlines]);

  const handlePetSummon = useCallback((count: number) => {
    const cost = count === 1 ? 100 : 900;
    if (player.gold < cost) return;

    const newPets: Pet[] = [];
    for (let i = 0; i < count; i++) {
      const template = PET_TEMPLATES[Math.floor(Math.random() * PET_TEMPLATES.length)];
      const newPet: Pet = {
        ...template,
        id: Math.random().toString(36).substr(2, 9),
      };
      newPets.push(newPet);
    }

    setPlayer(prev => ({
      ...prev,
      gold: prev.gold - cost,
      petCollection: [...prev.petCollection, ...newPets],
      activePetId: prev.activePetId || newPets[0].id
    }));
    setLastSummonedPets(newPets);
  }, [player.gold]);

  const handleCapture = useCallback((monster: Monster, isBoss: boolean) => {
    // Higher difficulty = higher capture rate
    // Boss = 100% capture
    const captureRate = isBoss ? 1.0 : 0.1 + (monster.level * 0.01);
    if (Math.random() > captureRate) return;

    const genders = [Gender.MALE, Gender.FEMALE, Gender.NON_BINARY];
    const classes = [HeroClass.MAGE, HeroClass.SWORDSMAN, HeroClass.HEALER];
    
    // Quality based on monster level/type
    let rarity = Rarity.C;
    const roll = Math.random();
    if (isBoss) {
      if (roll < 0.1) rarity = Rarity.S;
      else if (roll < 0.3) rarity = Rarity.A;
      else rarity = Rarity.B;
    } else {
      if (roll < 0.01) rarity = Rarity.S;
      else if (roll < 0.05) rarity = Rarity.A;
      else if (roll < 0.2) rarity = Rarity.B;
      else rarity = Rarity.C;
    }

    // Bloodline for prisoners: max 40% special, 60% human
    const specialRaces = Object.values(Race).filter(r => r !== Race.HUMAN);
    const specialRace = specialRaces[Math.floor(Math.random() * specialRaces.length)];
    const specialPurity = Math.floor(Math.random() * 41); // 0-40
    const bloodlines: Bloodline[] = [
      { race: specialRace, purity: specialPurity },
      { race: Race.HUMAN, purity: 100 - specialPurity }
    ];

    const newPrisoner: Prisoner = {
      id: Math.random().toString(36).substr(2, 9),
      name: monster.name.replace('【首领】', '').replace('【精英】', '') + "俘虏",
      gender: genders[Math.floor(Math.random() * genders.length)],
      class: classes[Math.floor(Math.random() * classes.length)],
      rarity: rarity,
      race: determineRaceFromBloodlines(bloodlines),
      bloodlines,
      will: 100,
      stats: { ...monster.stats },
      affection: 0
    };

    setPlayer(prev => ({
      ...prev,
      prisoners: [...prev.prisoners, newPrisoner]
    }));
  }, []);

  const handleHeroLevelUp = useCallback((heroId: string, levels: number) => {
    setPlayer(prev => {
      const hero = [...prev.collection, ...prev.offsprings].find(h => h.id === heroId);
      if (!hero) return prev;

      let totalExpNeeded = 0;
      let currentMaxExp = hero.maxExp;
      let currentExp = hero.exp;
      for (let i = 0; i < levels; i++) {
        totalExpNeeded += Math.max(0, currentMaxExp - currentExp);
        currentMaxExp = Math.floor(currentMaxExp * 1.1);
        currentExp = 0;
      }

      if (prev.exp < totalExpNeeded) return prev;

      const updateList = (list: any[]) => list.map(h => {
        if (h.id !== heroId) return h;
        
        let newExp = h.exp;
        let newLevel = h.level;
        let newMaxExp = h.maxExp;
        let newStats = { ...h.stats };
        let isBreakthroughRequired = h.isBreakthroughRequired || false;

        for (let i = 0; i < levels; i++) {
          if (isBreakthroughRequired || newLevel >= 100) break;
          
          newLevel++;
          newMaxExp = Math.floor(newMaxExp * 1.1);
          // Stats increase on level up - 1% increase
          newStats.hp = Math.floor(newStats.hp * 1.01);
          newStats.maxHp = newStats.hp;
          newStats.atk = Math.floor(newStats.atk * 1.01);
          newStats.def = Math.floor(newStats.def * 1.01);
          newStats.spd = Math.floor(newStats.spd * 1.01) || newStats.spd + 1;
          newStats.skill = Math.floor(newStats.skill * 1.01);

          if (newLevel % 20 === 0 && newLevel < 100) {
            isBreakthroughRequired = true;
          }
        }

        return {
          ...h,
          level: newLevel,
          exp: 0, // Reset exp after manual level up for simplicity or handle overflow
          maxExp: newMaxExp,
          stats: newStats,
          isBreakthroughRequired,
          rating: calculateRating(newStats, h.rarity, h.bloodlines)
        };
      });

      return { 
        ...prev, 
        exp: prev.exp - totalExpNeeded,
        collection: updateList(prev.collection),
        offsprings: updateList(prev.offsprings)
      };
    });
  }, []);

  const handleBreakthrough = useCallback((heroId: string) => {
    setPlayer(prev => {
      const hero = [...prev.collection, ...prev.offsprings].find(h => h.id === heroId);
      if (!hero || !hero.isBreakthroughRequired) return prev;

      const RARITY_INDEX: Record<Rarity, number> = {
        [Rarity.C]: 0, [Rarity.B]: 1, [Rarity.A]: 2, [Rarity.S]: 3, [Rarity.SS]: 4, [Rarity.SSS]: 5, [Rarity.SP]: 6,
      };
      const levelTier = Math.floor(hero.level / 20);
      const rarityIndex = RARITY_INDEX[hero.rarity];
      const cost = (levelTier * 5) + (rarityIndex * 5);

      if (prev.gems < cost) {
        alert('钻石不足！');
        return prev;
      }

      const updateList = (list: any[]) => list.map(h => h.id === heroId ? { ...h, isBreakthroughRequired: false } : h);

      return {
        ...prev,
        gems: prev.gems - cost,
        collection: updateList(prev.collection),
        offsprings: updateList(prev.offsprings)
      };
    });
  }, []);

  const handleManualLevelUp = useCallback((heroId: string) => {
    setLevelUpHeroId(heroId);
  }, []);

  const handleExportData = useCallback(() => {
    const data = JSON.stringify(player);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mythic_summoner_save_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [player]);

  const handleExportHtml = useCallback(() => {
    const data = JSON.stringify(player);
    const htmlContent = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>神话召唤师 - 存档导出</title>
    <style>
        body { font-family: system-ui, -apple-system, sans-serif; background: #09090b; color: #fff; padding: 2rem; line-height: 1.5; }
        .card { background: #18181b; border: 1px solid #27272a; padding: 1.5rem; border-radius: 1rem; max-width: 600px; margin: 0 auto; }
        h1 { color: #10b981; margin-top: 0; }
        .stat { display: flex; justify-content: space-between; margin-bottom: 0.5rem; border-bottom: 1px solid #27272a; padding-bottom: 0.5rem; }
        .label { color: #a1a1aa; }
        .value { font-weight: bold; }
        .json-box { background: #000; padding: 1rem; border-radius: 0.5rem; font-family: monospace; font-size: 12px; overflow: auto; max-height: 200px; margin-top: 1rem; white-space: pre-wrap; word-break: break-all; }
        .btn { display: block; width: 100%; padding: 1rem; background: #10b981; color: #000; text-align: center; text-decoration: none; border-radius: 0.5rem; font-weight: bold; margin-top: 1.5rem; cursor: pointer; border: none; }
        .btn:hover { background: #34d399; }
    </style>
</head>
<body>
    <div class="card">
        <h1>神话召唤师 存档</h1>
        <div class="stat"><span class="label">玩家名称:</span> <span class="value">${player.name}</span></div>
        <div class="stat"><span class="label">等级:</span> <span class="value">Lv.${player.level}</span></div>
        <div class="stat"><span class="label">宝石:</span> <span class="value">${player.gems}</span></div>
        <div class="stat"><span class="label">金币:</span> <span class="value">${player.gold}</span></div>
        <div class="stat"><span class="label">英雄数量:</span> <span class="value">${player.collection.length}</span></div>
        <div class="stat"><span class="label">囚犯数量:</span> <span class="value">${player.prisoners.length}</span></div>
        
        <p style="font-size: 12px; color: #71717a; margin-top: 1rem;">以下是加密的存档数据，您可以复制并粘贴到游戏的导入功能中：</p>
        <div class="json-box" id="saveData">${data}</div>
        
        <button class="btn" onclick="copyData()">复制存档数据</button>
    </div>

    <script>
        function copyData() {
            const data = document.getElementById('saveData').innerText;
            navigator.clipboard.writeText(data).then(() => {
                alert('存档数据已复制到剪贴板！');
            });
        }
    </script>
</body>
</html>
    `;
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mythic_summoner_save_${new Date().toISOString().split('T')[0]}.html`;
    a.click();
    URL.revokeObjectURL(url);
  }, [player]);

  const handleImportData = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        setPlayer(data);
        alert('数据导入成功！');
      } catch (err) {
        alert('数据导入失败，请检查文件格式。');
      }
    };
    reader.readAsText(file);
  }, []);

  const handleClearData = useCallback(() => {
    if (window.confirm('确定要清除所有存档数据吗？此操作不可撤销。')) {
      localStorage.removeItem('mythic_summoner_player_v2');
      window.location.reload();
    }
  }, []);

  const handleChat = useCallback((heroId: string) => {
    setPlayer(prev => {
      const collection = prev.collection.map(h => {
        if (h.id !== heroId) return h;
        return { ...h, affection: h.affection + 5 };
      });
      return { ...prev, collection };
    });
  }, []);

  const handleTryBreeding = useCallback((heroId: string, partnerId?: string) => {
    setPlayer(prev => {
      const hero = prev.collection.find(h => h.id === heroId) || prev.offsprings.find(o => o.id === heroId);
      if (!hero || hero.isBreeding || (hero.breedingCooldownEnd && Date.now() < hero.breedingCooldownEnd)) return prev;

      const attempts = (hero.pregnancyAttempts || 0) + 1;
      const success = Math.random() < 0.1 || attempts >= 10;

      const updateHero = (h: any) => {
        if (h.id !== heroId) return h;
        const updates: any = { 
          affection: h.affection + 10,
          pregnancyAttempts: success ? 0 : attempts 
        };
        if (success) {
          updates.isBreeding = true;
          updates.breedingEndTime = Date.now() + 5 * 60 * 1000;
          updates.fatherId = partnerId; // If partnerId is provided, it's the father
        }
        return { ...h, ...updates };
      };

      return {
        ...prev,
        collection: prev.collection.map(updateHero),
        offsprings: prev.offsprings.map(updateHero) as Offspring[]
      };
    });
  }, []);

  const handleSpeedUpBreeding = useCallback((heroId: string, itemType: InventoryItem['type']) => {
    setPlayer(prev => {
      const item = prev.inventory.find(i => i.type === itemType && i.count > 0);
      if (!item) return prev;

      const collection = prev.collection.map(h => {
        if (h.id !== heroId) return h;
        if (itemType === 'POTION_SPEED' && h.isBreeding && h.breedingEndTime) {
          return { ...h, breedingEndTime: h.breedingEndTime - 5 * 60 * 1000 };
        }
        if (itemType === 'POTION_COOLDOWN' && h.breedingCooldownEnd) {
          return { ...h, breedingCooldownEnd: h.breedingCooldownEnd - 60 * 60 * 1000 };
        }
        return h;
      });

      const inventory = prev.inventory.map(i => {
        if (i.type === itemType) return { ...i, count: i.count - 1 };
        return i;
      }).filter(i => i.count > 0);

      return { ...prev, collection, inventory };
    });
  }, []);

  const handleClaimOffspring = useCallback((heroId: string) => {
    setPlayer(prev => {
      const hero = prev.collection.find(h => h.id === heroId) || prev.offsprings.find(o => o.id === heroId);
      if (!hero || !hero.isBreeding || !hero.breedingEndTime || Date.now() < hero.breedingEndTime) return prev;

      const fatherId = (hero as any).fatherId;
      const father = prev.collection.find(h => h.id === fatherId) || prev.offsprings.find(o => o.id === fatherId) || { bloodlines: prev.bloodlines, parents: [] };

      // Generate Offspring
      const weights: Record<Rarity, number> = {
        [Rarity.C]: 1, [Rarity.B]: 2, [Rarity.A]: 5, [Rarity.S]: 15, [Rarity.SS]: 40, [Rarity.SSS]: 100, [Rarity.SP]: 250,
      };
      const parentWeight = weights[hero.rarity];
      const roll = Math.random();
      let rarity = Rarity.C;
      if (roll < parentWeight / 1000) rarity = Rarity.SSS;
      else if (roll < parentWeight / 200) rarity = Rarity.SS;
      else if (roll < parentWeight / 50) rarity = Rarity.S;
      else if (roll < parentWeight / 20) rarity = Rarity.A;
      else if (roll < parentWeight / 5) rarity = Rarity.B;

      // Bloodline
      const combined: Record<string, number> = {};
      [...father.bloodlines, ...hero.bloodlines].forEach(b => {
        combined[b.race] = (combined[b.race] || 0) + b.purity / 2;
      });
      let bloodlines = Object.entries(combined).map(([race, purity]) => ({ race: race as Race, purity }));
      const mainRace = determineRaceFromBloodlines(bloodlines);
      
        const stats = generateBaseStats(rarity);
        
        const offspring: Offspring = {
          id: Math.random().toString(36).substr(2, 9),
          name: `${hero.name}之子`,
          rarity,
          class: hero.class,
          gender: Math.random() > 0.5 ? Gender.MALE : Gender.FEMALE,
          race: mainRace,
          bloodlines,
          level: 1,
          exp: 0,
          maxExp: 100,
          stats,
          description: "继承了强大血统的后代。",
          rating: calculateRating(stats, rarity, bloodlines),
          affection: 30,
          isAdult: false,
          trainingCount: 0,
          motherId: hero.id,
          fatherId: fatherId || 'player',
          parents: [hero.id, fatherId || 'player'],
          grandparents: [...(hero.parents || []), ...(father.parents || [])].slice(0, 4)
        };

      const updateHero = (h: any) => {
        if (h.id !== heroId) return h;
        return {
          ...h,
          isBreeding: false,
          breedingEndTime: undefined,
          breedingCooldownEnd: Date.now() + 60 * 60 * 1000, // 1 hour
          fatherId: undefined
        };
      };

      return {
        ...prev,
        collection: prev.collection.map(updateHero),
        offsprings: [...prev.offsprings.map(updateHero) as Offspring[], offspring]
      };
    });
  }, []);

  const handleTrainOffspring = useCallback((offspringId: string, statType: keyof Stats) => {
    setPlayer(prev => {
      const offspring = prev.offsprings.find(o => o.id === offspringId);
      const book = prev.inventory.find(i => i.type === 'TRAINING_BOOK' && i.count > 0);
      if (!offspring || offspring.isAdult || offspring.trainingCount >= 10 || !book) return prev;

      const offsprings = prev.offsprings.map(o => {
        if (o.id !== offspringId) return o;
        const stats = { ...o.stats };
        const gain = Math.floor(Math.random() * 10) + 5;
        if (statType === 'hp' || statType === 'maxHp') {
          stats.maxHp += gain * 5;
          stats.hp = stats.maxHp;
        } else {
          stats[statType] += gain;
        }
        return {
          ...o,
          stats,
          trainingCount: o.trainingCount + 1,
          rating: calculateRating(stats, o.rarity, o.bloodlines)
        };
      });

      const inventory = prev.inventory.map(i => {
        if (i.type === 'TRAINING_BOOK') return { ...i, count: i.count - 1 };
        return i;
      }).filter(i => i.count > 0);

      return { ...prev, offsprings, inventory };
    });
  }, []);

  const handleFinishTraining = useCallback((offspringId: string) => {
    setPlayer(prev => {
      const offspring = prev.offsprings.find(o => o.id === offspringId);
      if (!offspring || offspring.isAdult) return prev;

      const offsprings = prev.offsprings.map(o => {
        if (o.id !== offspringId) return o;
        return { ...o, isAdult: true };
      });

      return { ...prev, offsprings };
    });
  }, []);

  const handleChangePlayerBloodline = useCallback((offspringId: string) => {
    setPlayer(prev => {
      const offspring = prev.offsprings.find(o => o.id === offspringId);
      if (!offspring) return prev;
      return { ...prev, bloodlines: offspring.bloodlines };
    });
  }, []);

  const handleBuyItem = useCallback((itemType: InventoryItem['type'], price: number, currency: 'gold' | 'gems') => {
    setPlayer(prev => {
      if (prev[currency] < price) return prev;
      
      const itemName = itemType === 'POTION_SPEED' ? '快速孕育药剂' : 
                       itemType === 'POTION_COOLDOWN' ? '消除冷却药剂' : '子嗣培养书';
      
      const inventory = [...prev.inventory];
      const existing = inventory.find(i => i.type === itemType);
      if (existing) {
        existing.count++;
      } else {
        inventory.push({ id: Math.random().toString(36).substr(2, 9), name: itemName, count: 1, type: itemType });
      }

      return {
        ...prev,
        [currency]: prev[currency] - price,
        inventory
      };
    });
  }, []);

  const handleExchangeCurrency = useCallback((mode: 'gem_to_gold' | 'gold_to_gem', amount: number = 1) => {
    setPlayer(prev => {
      if (mode === 'gem_to_gold') {
        if (prev.gems < amount) return prev;
        return { ...prev, gems: prev.gems - amount, gold: prev.gold + amount * 100 };
      } else {
        const cost = amount * 150;
        if (prev.gold < cost) return prev;
        return { ...prev, gold: prev.gold - cost, gems: prev.gems + amount };
      }
    });
  }, []);

  const handlePersuade = useCallback((prisoner: Prisoner) => {
    if (prisoner.will > 0) return;

    const newHero: Hero = {
      id: prisoner.id,
      name: prisoner.name,
      rarity: prisoner.rarity,
      class: prisoner.class,
      gender: prisoner.gender,
      race: determineRaceFromBloodlines(prisoner.bloodlines),
      bloodlines: prisoner.bloodlines,
      level: 1,
      exp: 0,
      maxExp: 100,
      stats: { ...prisoner.stats },
      description: "曾经的俘虏，现在是忠诚的伙伴。",
      rating: calculateRating(prisoner.stats, prisoner.rarity, prisoner.bloodlines),
      affection: 50
    };

    setPlayer(prev => ({
      ...prev,
      prisoners: prev.prisoners.filter(p => p.id !== prisoner.id),
      collection: [...prev.collection, newHero]
    }));
  }, []);

  const handleExecute = useCallback((id: string) => {
    setPlayer(prev => {
      const prisoner = prev.prisoners.find(p => p.id === id);
      if (!prisoner) return prev;
      
      const gemRewards: Record<Rarity, number> = {
        [Rarity.C]: 10, [Rarity.B]: 20, [Rarity.A]: 50, [Rarity.S]: 100, [Rarity.SS]: 200, [Rarity.SSS]: 500, [Rarity.SP]: 2000
      };
      
      return {
        ...prev,
        gems: prev.gems + gemRewards[prisoner.rarity],
        prisoners: prev.prisoners.filter(p => p.id !== id)
      };
    });
  }, []);

  const handleBulkExecute = useCallback((rarities: Rarity[]) => {
    setPlayer(prev => {
      let gemGain = 0;
      const gemRewards: Record<Rarity, number> = {
        [Rarity.C]: 10, [Rarity.B]: 20, [Rarity.A]: 50, [Rarity.S]: 100, [Rarity.SS]: 200, [Rarity.SSS]: 500, [Rarity.SP]: 2000
      };

      const remainingPrisoners = prev.prisoners.filter(p => {
        if (rarities.includes(p.rarity) && !p.isLocked) {
          gemGain += gemRewards[p.rarity];
          return false;
        }
        return true;
      });

      const remainingCollection = prev.collection.filter(h => {
        if (rarities.includes(h.rarity) && !h.isLocked) {
          gemGain += gemRewards[h.rarity];
          return false;
        }
        return true;
      });

      const remainingOffsprings = prev.offsprings.filter(o => {
        if (rarities.includes(o.rarity) && !o.isLocked) {
          gemGain += gemRewards[o.rarity];
          return false;
        }
        return true;
      });

      return {
        ...prev,
        gems: prev.gems + gemGain,
        prisoners: remainingPrisoners,
        collection: remainingCollection,
        offsprings: remainingOffsprings
      };
    });
  }, []);

  const handleSexualPunishment = useCallback((id: string, part: BodyPart) => {
    setPlayer(prev => {
      const prisoner = prev.prisoners.find(p => p.id === id);
      if (!prisoner) return prev;

      const isPregnancyPart = part === BodyPart.VAGINA || part === BodyPart.ANUS;
      const attempts = (prisoner.pregnancyAttempts || 0) + 1;
      const success = isPregnancyPart && (Math.random() < 0.2 || attempts >= 10);

      const prisoners = prev.prisoners.map(p => {
        if (p.id !== id) return p;
        
        const updates: Partial<Prisoner> = {
          will: Math.max(0, p.will - 15),
          pregnancyAttempts: success ? 0 : attempts
        };

        if (success) {
          const consecutive = (p.consecutivePregnancies || 0) + 1;
          updates.isPregnant = true;
          updates.pregnancyEndTime = Date.now() + 5 * 60 * 1000;
          updates.consecutivePregnancies = consecutive;
          
          if (consecutive >= 3) {
            const breakdownChance = 0.05 * (consecutive - 2);
            if (Math.random() < breakdownChance) {
              updates.mentalState = MentalState.BREAKDOWN;
            }
          }
        }

        return { ...p, ...updates };
      });

      return { ...prev, prisoners };
    });
  }, []);

  const handleSpeedUpPrisonerPregnancy = useCallback((id: string) => {
    setPlayer(prev => {
      if (prev.gems < 50) return prev;
      
      const prisoner = prev.prisoners.find(p => p.id === id);
      if (!prisoner || !prisoner.isPregnant) return prev;

      // Immediate generation
      const weights: Record<Rarity, number> = {
        [Rarity.C]: 1, [Rarity.B]: 2, [Rarity.A]: 5, [Rarity.S]: 15, [Rarity.SS]: 40, [Rarity.SSS]: 100, [Rarity.SP]: 250,
      };
      const parentWeight = weights[prisoner.rarity];
      const roll = Math.random();
      let rarity = Rarity.C;
      if (roll < parentWeight / 1000) rarity = Rarity.SSS;
      else if (roll < parentWeight / 200) rarity = Rarity.SS;
      else if (roll < parentWeight / 50) rarity = Rarity.S;
      else if (roll < parentWeight / 20) rarity = Rarity.A;
      else if (roll < parentWeight / 5) rarity = Rarity.B;

        const stats = generateBaseStats(rarity);

        const offspring: Offspring = {
          id: Math.random().toString(36).substr(2, 9),
          name: `${prisoner.name}之子`,
          rarity,
          class: prisoner.class,
          gender: Math.random() > 0.5 ? Gender.MALE : Gender.FEMALE,
          race: prisoner.race,
          bloodlines: prisoner.bloodlines,
          level: 1,
          exp: 0,
          maxExp: 100,
          stats,
          description: "在囚牢中诞下的后代。",
          rating: calculateRating(stats, rarity, prisoner.bloodlines),
          affection: 30,
          isAdult: false,
          trainingCount: 0,
          motherId: prisoner.id,
          fatherId: 'player',
          isPrisonOrigin: true,
          parents: [prisoner.id, 'player'],
          grandparents: prisoner.bloodlines.map(b => b.race).slice(0, 2)
        };

      const prisoners = prev.prisoners.map(p => {
        if (p.id !== id) return p;
        return { ...p, isPregnant: false, pregnancyEndTime: undefined };
      });

      return {
        ...prev,
        gems: prev.gems - 50,
        prisoners,
        offsprings: [...prev.offsprings, offspring]
      };
    });
  }, []);

  const handleSendToPrison = useCallback((id: string, type: 'hero' | 'offspring') => {
    setPlayer(prev => {
      const list = type === 'hero' ? prev.collection : prev.offsprings;
      const target = list.find(x => x.id === id);
      if (!target) return prev;
      if (target.isLocked) {
        alert('该角色已锁定，无法关入囚笼！');
        return prev;
      }

      const newPrisoner: Prisoner = {
        id: target.id,
        name: target.name,
        gender: target.gender,
        class: target.class,
        rarity: target.rarity,
        race: target.race,
        bloodlines: target.bloodlines,
        will: 100,
        stats: { ...target.stats },
        affection: Math.max(-10000, target.affection - 50)
      };

      return {
        ...prev,
        activeHeroId: prev.activeHeroId === id ? null : prev.activeHeroId,
        collection: prev.collection.filter(h => h.id !== id),
        offsprings: prev.offsprings.filter(o => o.id !== id),
        prisoners: [...prev.prisoners, newPrisoner]
      };
    });
  }, []);

  const handleToggleLock = useCallback((id: string, type: 'hero' | 'offspring' | 'prisoner') => {
    setPlayer(prev => {
      const update = (list: any[]) => list.map(item => item.id === id ? { ...item, isLocked: !item.isLocked } : item);
      return {
        ...prev,
        collection: type === 'hero' ? update(prev.collection) : prev.collection,
        offsprings: type === 'offspring' ? update(prev.offsprings) : prev.offsprings,
        prisoners: type === 'prisoner' ? update(prev.prisoners) : prev.prisoners,
      };
    });
  }, []);

  const handleTogglePin = useCallback((id: string, type: 'hero' | 'offspring') => {
    setPlayer(prev => {
      const update = (list: any[]) => list.map(item => item.id === id ? { ...item, isPinned: !item.isPinned } : item);
      return {
        ...prev,
        collection: type === 'hero' ? update(prev.collection) : prev.collection,
        offsprings: type === 'offspring' ? update(prev.offsprings) : prev.offsprings,
      };
    });
  }, []);

  const handleTorture = useCallback((id: string, type: 'wax' | 'whip' | 'toy') => {
    const willLoss = { wax: 10, whip: 20, toy: 15 }[type];
    setPlayer(prev => ({
      ...prev,
      prisoners: prev.prisoners.map(p => p.id === id ? { ...p, will: Math.max(0, p.will - willLoss) } : p)
    }));
  }, []);

  const handleBattleEnd = useCallback((won: boolean, rewards: { gold: number, gems: number, exp: number }, monster: Monster) => {
    if (won) {
      setPlayer(prev => {
        let newUnlockedChapter = prev.unlockedChapter;
        let newUnlockedLevel = prev.unlockedLevel;

        // If we just beat the furthest unlocked level, unlock the next one
        if (prev.currentStage === prev.unlockedChapter && prev.currentSubStage === prev.unlockedLevel) {
          if (prev.unlockedLevel < 10) {
            newUnlockedLevel = prev.unlockedLevel + 1;
          } else if (prev.unlockedChapter < 20) {
            newUnlockedChapter = prev.unlockedChapter + 1;
            newUnlockedLevel = 1;
          }
        }

        const clearedEliteStages = [...prev.clearedEliteStages];
        const stageKey = `${prev.currentStage}-${prev.currentSubStage}`;
        if ((monster.type === MonsterType.ELITE || monster.type === MonsterType.BOSS) && !clearedEliteStages.includes(stageKey)) {
          clearedEliteStages.push(stageKey);
        }

        // Give EXP to active hero
        const updateList = (list: any[]) => list.map(h => {
          if (h.id !== prev.activeHeroId) return h;
          
          let newExp = h.exp + rewards.exp;
          let newLevel = h.level;
          let newMaxExp = h.maxExp;
          let newStats = { ...h.stats };
          let isBreakthroughRequired = h.isBreakthroughRequired || false;

          while (newExp >= newMaxExp && !isBreakthroughRequired && newLevel < 100) {
            newExp -= newMaxExp;
            newLevel++;
            newMaxExp = Math.floor(newMaxExp * 1.1);
            newStats.hp = Math.floor(newStats.hp * 1.01);
            newStats.maxHp = newStats.hp;
            newStats.atk = Math.floor(newStats.atk * 1.01);
            newStats.def = Math.floor(newStats.def * 1.01);
            newStats.spd = Math.floor(newStats.spd * 1.01) || newStats.spd + 1;
            newStats.skill = Math.floor(newStats.skill * 1.01);

            if (newLevel % 20 === 0 && newLevel < 100) {
              isBreakthroughRequired = true;
            }
          }

          return {
            ...h,
            level: newLevel,
            exp: newExp,
            maxExp: newMaxExp,
            stats: newStats,
            isBreakthroughRequired,
            rating: calculateRating(newStats, h.rarity, h.bloodlines)
          };
        });

        return {
          ...prev,
          gold: prev.gold + rewards.gold,
          gems: prev.gems + rewards.gems,
          exp: prev.exp + rewards.exp,
          unlockedChapter: newUnlockedChapter,
          unlockedLevel: newUnlockedLevel,
          clearedEliteStages,
          collection: updateList(prev.collection),
          offsprings: updateList(prev.offsprings)
        };
      });
      handleCapture(monster, monster.type === MonsterType.BOSS);
    }
  }, [handleCapture]);

  const handleClaimChapterReward = useCallback((chapter: number) => {
    setPlayer(prev => {
      if (prev.clearedChapters.includes(chapter)) return prev;
      // Check if chapter is fully cleared (all 10 levels)
      // Actually, if they unlocked the next chapter, it means they cleared this one
      if (prev.unlockedChapter <= chapter && !(prev.unlockedChapter === chapter + 1)) return prev;

      return {
        ...prev,
        gems: prev.gems + 2000,
        clearedChapters: [...prev.clearedChapters, chapter]
      };
    });
  }, []);

  const handleRetryBattle = useCallback(() => {
    setGameState(GameState.BATTLE);
  }, []);

  const handleNextLevel = useCallback(() => {
    setPlayer(prev => {
      let nextLevel = prev.currentSubStage + 1;
      let nextChapter = prev.currentStage;
      if (nextLevel > 10) {
        if (nextChapter < 20) {
          nextChapter++;
          nextLevel = 1;
        } else {
          // Already at max level
          return prev;
        }
      }
      
      // Check if the next level is unlocked
      if (nextChapter > prev.unlockedChapter || (nextChapter === prev.unlockedChapter && nextLevel > prev.unlockedLevel)) {
        return prev;
      }

      return { ...prev, currentStage: nextChapter, currentSubStage: nextLevel };
    });
    // Re-trigger battle by setting state to LOBBY then back to BATTLE quickly
    // or just let the key change in BattleScreen handle it
    setGameState(GameState.LOBBY);
    setTimeout(() => setGameState(GameState.BATTLE), 10);
  }, []);

  const handleSweep = useCallback(() => {
    setPlayer(prev => {
      let totalGold = 0;
      let totalGems = 0;
      let totalExp = 0;

      const m = generateMonster(prev.currentStage, prev.currentSubStage);
      for (let i = 0; i < 10; i++) {
        totalGold += m.rewards.gold;
        totalGems += m.rewards.gems;
        totalExp += m.rewards.exp;
      }

      return {
        ...prev,
        gold: prev.gold + totalGold,
        gems: prev.gems + totalGems,
        exp: prev.exp + totalExp
      };
    });
    alert('扫荡完成！获得了大量奖励。');
  }, []);

  const handleEquipPet = useCallback((heroId: string, petId: string | null) => {
    setPlayer(prev => ({
      ...prev,
      collection: prev.collection.map(h => h.id === heroId ? { ...h, equippedPetId: petId } : h)
    }));
  }, []);

  const activeHero = player.collection.find(h => h.id === player.activeHeroId) || player.offsprings.find(o => o.id === player.activeHeroId) || null;
  const activePet = player.petCollection.find(p => p.id === player.activePetId) || null;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans selection:bg-emerald-500/30 overflow-hidden">
      {/* Top Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/10 px-4 sm:px-6 py-1 sm:py-1.5 flex justify-between items-center">
        <div className="flex items-center gap-3 sm:gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/50">
              <Sword className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
            </div>
            <div className="hidden xs:block">
              <div className="text-[10px] text-white/50 font-mono uppercase tracking-wider">等级 {player.level}</div>
              <div className="text-xs sm:text-sm font-bold truncate max-w-[80px] sm:max-w-none">{player.name}</div>
            </div>
          </div>
          
          <div className="h-8 w-px bg-white/10 hidden sm:block" />
          
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="flex items-center gap-1.5 sm:gap-2 bg-white/5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full border border-white/10">
              <Coins className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400" />
              <span className="text-xs sm:text-sm font-mono font-bold">{player.gold}</span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2 bg-white/5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full border border-white/10">
              <Gem className="w-3 h-3 sm:w-4 sm:h-4 text-cyan-400" />
              <span className="text-xs sm:text-sm font-mono font-bold">{player.gems}</span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2 bg-white/5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full border border-white/10">
              <Trophy className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-400" />
              <span className="text-xs sm:text-sm font-mono font-bold">{player.exp}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsSettingsOpen(true)}
            className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/60 hover:text-white"
          >
            <Settings className="w-5 h-5" />
          </button>
          {gameState !== GameState.LOBBY && gameState !== GameState.GENDER_SELECT && (
            <button 
              onClick={() => setGameState(GameState.LOBBY)}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <main className="pt-14 h-screen relative">
        <AnimatePresence mode="wait">
          {gameState === GameState.GENDER_SELECT && (
            <motion.div
              key="gender-select"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full flex flex-col items-center justify-center p-6"
            >
              <h2 className="text-4xl font-bold mb-8">选择你的身份</h2>
              <div className="grid grid-cols-3 gap-6">
                {[Gender.MALE, Gender.FEMALE, Gender.NON_BINARY].map(g => (
                  <button
                    key={g}
                    onClick={() => {
                      updatePlayerStats({ gender: g });
                      setGameState(GameState.LOBBY);
                    }}
                    className="p-8 rounded-3xl bg-zinc-900 border border-white/10 hover:border-emerald-500 transition-all text-2xl font-bold"
                  >
                    {g}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {gameState === GameState.LOBBY && (
            <Lobby 
              key="lobby"
              player={player}
              activeHero={activeHero}
              activePet={activePet}
              onNavigate={setGameState}
              onRenameHero={renameHero}
              onManualLevelUp={handleManualLevelUp}
              onOpenSettings={() => setIsSettingsOpen(true)}
              onSelectStage={(chapter, level) => {
                setPlayer(prev => ({ ...prev, currentStage: chapter, currentSubStage: level }));
              }}
              onClaimChapterReward={handleClaimChapterReward}
            />
          )}
          {gameState === GameState.GACHA && (
            <GachaScreen 
              key="gacha"
              player={player}
              onSummon={handleSummon}
              onSetTargetRace={(race) => setPlayer(prev => ({ ...prev, targetRace: race }))}
              lastSummoned={lastSummoned}
            />
          )}
          {gameState === GameState.PET_GACHA && (
            <PetGachaScreen 
              key="pet-gacha"
              player={player}
              onSummon={handlePetSummon}
              lastSummoned={lastSummonedPets}
            />
          )}
          {gameState === GameState.BATTLE && (
            <BattleScreen 
              key={`${player.currentStage}-${player.currentSubStage}`}
              hero={activeHero!}
              difficulty={player.currentStage}
              subStage={player.currentSubStage}
              onBattleEnd={handleBattleEnd}
              onRetry={handleRetryBattle}
              onExit={() => setGameState(GameState.LOBBY)}
              onSweep={handleSweep}
              onNextLevel={handleNextLevel}
            />
          )}
          {gameState === GameState.COLLECTION && (
            <Collection 
              key="collection"
              player={player}
              onSelectHero={(id) => setPlayer(prev => ({ ...prev, activeHeroId: id }))}
              onSelectPet={(id) => setPlayer(prev => ({ ...prev, activePetId: id }))}
              onRenameHero={renameHero}
              onEquipPet={handleEquipPet}
              onTrainOffspring={(id) => {
                setSelectedOffspringId(id);
                setGameState(GameState.OFFSPRING_TRAINING);
              }}
              onChangePlayerBloodline={handleChangePlayerBloodline}
              onToggleLock={handleToggleLock}
              onTogglePin={handleTogglePin}
              onBulkExecute={handleBulkExecute}
              onImprison={handleSendToPrison}
            />
          )}
          {gameState === GameState.PRISON && (
            <PrisonScreen 
              key="prison"
              player={player}
              onPersuade={handlePersuade}
              onExecute={handleExecute}
              onTorture={handleTorture}
              onSexualPunishment={handleSexualPunishment}
              onToggleLock={handleToggleLock}
              onBulkExecute={handleBulkExecute}
              onSpeedUpPregnancy={handleSpeedUpPrisonerPregnancy}
            />
          )}
          {gameState === GameState.INTERACTION && (
            <InteractionScreen 
              key="interaction"
              player={player}
              activeHero={activeHero!}
              onUpdateAffection={updateHeroAffection}
              onUpdateStats={updatePlayerStats}
              onRenameHero={renameHero}
              onUpdateGender={updateHeroGender}
              onStartBreeding={handleTryBreeding}
              onSpeedUpBreeding={handleSpeedUpBreeding}
              onClaimOffspring={handleClaimOffspring}
              onManualLevelUp={handleManualLevelUp}
            />
          )}
          {gameState === GameState.SHOP && (
            <ShopScreen
              key="shop"
              player={player}
              onBuyItem={handleBuyItem}
              onExchange={handleExchangeCurrency}
            />
          )}
          {gameState === GameState.GALLERY && (
            <GalleryScreen 
              key="gallery"
              player={player}
              onClose={() => setGameState(GameState.LOBBY)}
            />
          )}
          {gameState === GameState.OFFSPRING_TRAINING && selectedOffspringId && (
            <OffspringTrainingScreen
              key="offspring-training"
              player={player}
              offspring={player.offsprings.find(o => o.id === selectedOffspringId)!}
              onTrain={handleTrainOffspring}
              onFinish={(id) => {
                handleFinishTraining(id);
                setGameState(GameState.COLLECTION);
              }}
              onBack={() => setGameState(GameState.COLLECTION)}
            />
          )}
        </AnimatePresence>
      </main>

      <AnimatePresence>
        {isSettingsOpen && (
          <SettingsModal 
            onClose={() => setIsSettingsOpen(false)}
            onExport={handleExportData}
            onExportHtml={handleExportHtml}
            onImport={handleImportData}
            onClear={handleClearData}
          />
        )}
        {levelUpHeroId && (
          <LevelUpModal 
            hero={[...player.collection, ...player.offsprings].find(h => h.id === levelUpHeroId)!}
            player={player}
            onClose={() => setLevelUpHeroId(null)}
            onLevelUp={handleHeroLevelUp}
            onBreakthrough={handleBreakthrough}
          />
        )}
      </AnimatePresence>

      {/* Mobile Stats Bar */}
      <div className="fixed bottom-0 left-0 right-0 sm:hidden bg-black/80 backdrop-blur-md border-t border-white/10 px-6 py-3 flex justify-around items-center z-50">
        <div className="flex items-center gap-2">
          <Coins className="w-4 h-4 text-yellow-400" />
          <span className="text-sm font-mono font-bold">{player.gold}</span>
        </div>
        <div className="flex items-center gap-2">
          <Gem className="w-4 h-4 text-cyan-400" />
          <span className="text-sm font-mono font-bold">{player.gems}</span>
        </div>
      </div>
    </div>
  );
}
