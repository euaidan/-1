/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sword, Sparkles, Trophy, Users, Coins, Gem, ChevronLeft, Play, Info, Save, Upload, Trash2, Database } from 'lucide-react';
import { GameState, Player, Hero, Monster, Rarity, Gender, HeroClass, Pet, Stats, Prisoner, MonsterType, Race, Bloodline, InventoryItem, Offspring, MentalState, BodyPart } from './types';
import { HERO_NAMES, PET_TEMPLATES, generateMonster } from './constants';
import { cn } from './lib/utils';

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

const INITIAL_PLAYER: Player = {
  name: "新进召唤师",
  gender: Gender.NON_BINARY,
  gold: 1000,
  gems: 200,
  exp: 0,
  level: 1,
  currentStage: 1,
  currentSubStage: 1,
  clearedEliteStages: [],
  collection: [],
  petCollection: [],
  prisoners: [],
  activeHeroId: null,
  activePetId: null,
  pityCount: 0,
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
      currentSubStage: parsed.currentSubStage || 1,
      clearedEliteStages: parsed.clearedEliteStages || [],
    };
  });
  const [lastSummoned, setLastSummoned] = useState<Hero[]>([]);
  const [lastSummonedPets, setLastSummonedPets] = useState<Pet[]>([]);
  const [selectedDifficulty, setSelectedDifficulty] = useState(player.currentStage || 1);
  const [selectedOffspringId, setSelectedOffspringId] = useState<string | null>(null);

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
              [Rarity.C]: 1, [Rarity.B]: 2, [Rarity.A]: 5, [Rarity.S]: 15, [Rarity.SS]: 40, [Rarity.SSS]: 100,
            };
            const parentWeight = weights[p.rarity];
            const roll = Math.random();
            let rarity = Rarity.C;
            if (roll < parentWeight / 1000) rarity = Rarity.SSS;
            else if (roll < parentWeight / 200) rarity = Rarity.SS;
            else if (roll < parentWeight / 50) rarity = Rarity.S;
            else if (roll < parentWeight / 20) rarity = Rarity.A;
            else if (roll < parentWeight / 5) rarity = Rarity.B;

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
              stats: { hp: 100, maxHp: 100, atk: 20, def: 10, spd: 10, skill: 10 },
              description: "在囚牢中诞下的后代。",
              rating: Math.floor(Math.random() * 50) + 50,
              affection: 30,
              isAdult: false,
              trainingCount: 0,
              motherId: p.id,
              fatherId: 'player',
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
    setPlayer(prev => ({
      ...prev,
      collection: prev.collection.map(h => h.id === heroId ? { ...h, affection: Math.min(1000, h.affection + amount) } : h)
    }));
  }, []);

  const updatePlayerStats = useCallback((updates: Partial<Player>) => {
    setPlayer(prev => ({ ...prev, ...updates }));
  }, []);

  const handleSummon = useCallback((count: number, targetRace: Race) => {
    const cost = count === 1 ? 100 : 900;
    if (player.gems < cost) return false;

    const newHeroes: Hero[] = [];
    let newPityCount = player.pityCount;

    for (let i = 0; i < count; i++) {
      newPityCount++;
      const rarityRoll = Math.random();
      let rarity = Rarity.C;
      let race = Race.HUMAN;
      let bloodlines: Bloodline[] = [{ race: Race.HUMAN, purity: 100 }];

      // SSS Pure Blood Check (0.1% or Pity 100)
      if (rarityRoll < 0.001 || newPityCount >= 100) {
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
          race = purity > 50 ? specialRace : Race.HUMAN;
          bloodlines = [
            { race: specialRace, purity },
            { race: Race.HUMAN, purity: 100 - purity }
          ];
        }
      }

      const classes = [HeroClass.MAGE, HeroClass.SWORDSMAN, HeroClass.HEALER];
      const hClass = classes[Math.floor(Math.random() * classes.length)];
      const genders = [Gender.MALE, Gender.FEMALE, Gender.NON_BINARY];
      const gender = genders[Math.floor(Math.random() * genders.length)];
      
      const baseStatsMap = {
        [Rarity.C]: { min: 10, max: 30 },
        [Rarity.B]: { min: 30, max: 60 },
        [Rarity.A]: { min: 60, max: 100 },
        [Rarity.S]: { min: 100, max: 200 },
        [Rarity.SS]: { min: 200, max: 400 },
        [Rarity.SSS]: { min: 400, max: 800 },
      };
      const baseStats = baseStatsMap[rarity];

      const stats: Stats = {
        hp: Math.floor(Math.random() * (baseStats.max - baseStats.min) + baseStats.min) * 5,
        maxHp: 0,
        atk: Math.floor(Math.random() * (baseStats.max - baseStats.min) + baseStats.min),
        def: Math.floor(Math.random() * (baseStats.max - baseStats.min) + baseStats.min) / 2,
        spd: Math.floor(Math.random() * 20) + 5,
        skill: Math.floor(Math.random() * (baseStats.max - baseStats.min) + baseStats.min),
      };
      stats.maxHp = stats.hp;

      const rating = stats.hp / 5 + stats.atk + stats.def + stats.spd + stats.skill;

      const newHero: Hero = {
        id: Math.random().toString(36).substr(2, 9),
        name: HERO_NAMES[Math.floor(Math.random() * HERO_NAMES.length)],
        rarity,
        class: hClass,
        gender,
        race,
        bloodlines,
        level: 1,
        exp: 0,
        maxExp: 100,
        stats,
        description: `一位来自${race}的英雄。`,
        rating: Math.floor(rating),
        affection: 0
      };
      newHeroes.push(newHero);
    }

    setPlayer(prev => ({
      ...prev,
      gems: prev.gems - cost,
      collection: [...prev.collection, ...newHeroes],
      activeHeroId: prev.activeHeroId || newHeroes[0].id,
      pityCount: newPityCount,
      targetRace
    }));
    setLastSummoned(newHeroes);
    return true;
  }, [player.gems, player.pityCount]);

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
      race: Race.HUMAN,
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

  const handleHeroLevelUp = useCallback((heroId: string, expGain: number) => {
    setPlayer(prev => {
      const updateList = (list: any[]) => list.map(h => {
        if (h.id !== heroId) return h;
        
        let newExp = h.exp + expGain;
        let newLevel = h.level;
        let newMaxExp = h.maxExp;
        let newStats = { ...h.stats };
        let isBreakthroughRequired = h.isBreakthroughRequired || false;

        while (newExp >= newMaxExp && newLevel < 80 && !isBreakthroughRequired) {
          // Check for breakthrough at 20, 40, 60
          if ((newLevel === 20 || newLevel === 40 || newLevel === 60)) {
            isBreakthroughRequired = true;
            break;
          }

          newExp -= newMaxExp;
          newLevel++;
          newMaxExp = Math.floor(newMaxExp * 1.1);
          // Stats increase on level up - 1% increase
          newStats.hp = Math.floor(newStats.hp * 1.01);
          newStats.maxHp = newStats.hp;
          newStats.atk = Math.floor(newStats.atk * 1.01);
          newStats.def = Math.floor(newStats.def * 1.01);
          newStats.spd = Math.floor(newStats.spd * 1.01) || newStats.spd + 1;
          newStats.skill = Math.floor(newStats.skill * 1.01);
        }

        return {
          ...h,
          level: newLevel,
          exp: newExp,
          maxExp: newMaxExp,
          stats: newStats,
          isBreakthroughRequired,
          rating: Math.floor(newStats.hp / 5 + newStats.atk + newStats.def + newStats.spd + newStats.skill)
        };
      });

      return { 
        ...prev, 
        collection: updateList(prev.collection),
        offsprings: updateList(prev.offsprings)
      };
    });
  }, []);

  const handleManualLevelUp = useCallback((heroId: string) => {
    setPlayer(prev => {
      const hero = [...prev.collection, ...prev.offsprings].find(h => h.id === heroId);
      if (!hero || hero.level >= 80) return prev;
      
      // Breakthrough check
      if (hero.isBreakthroughRequired) {
        const cost = hero.level * 100;
        if (prev.gold < cost) return prev;
        
        const updateList = (list: any[]) => list.map(h => h.id === heroId ? { ...h, isBreakthroughRequired: false } : h);
        
        const nextState = {
          ...prev,
          gold: prev.gold - cost,
          collection: updateList(prev.collection),
          offsprings: updateList(prev.offsprings)
        };
        
        // Trigger level up check again after breakthrough
        setTimeout(() => handleHeroLevelUp(heroId, 0), 0);
        return nextState;
      }

      // Use player EXP to level up hero? Or just check if they have enough hero EXP
      // The request says "角色点击的等级可以升级", usually this means spending a resource.
      // I'll implement it as: if they have enough EXP, level up. If not, maybe spend player EXP?
      // Let's assume it's just a manual trigger for the level up check if it got stuck or for breakthrough.
      handleHeroLevelUp(heroId, 0);
      return prev;
    });
  }, [handleHeroLevelUp]);

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
        [Rarity.C]: 1, [Rarity.B]: 2, [Rarity.A]: 5, [Rarity.S]: 15, [Rarity.SS]: 40, [Rarity.SSS]: 100,
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
      const maxPurity = Math.max(...bloodlines.map(r => r.purity));
      const mainRace = bloodlines.find(r => r.purity === maxPurity)?.race;
      if (mainRace) {
        let assimilatedPurity = 0;
        bloodlines = bloodlines.filter(r => {
          if (r.race !== mainRace && r.purity < 0.01) {
            assimilatedPurity += r.purity;
            return false;
          }
          return true;
        });
        const mainIdx = bloodlines.findIndex(r => r.race === mainRace);
        bloodlines[mainIdx].purity += assimilatedPurity;
      }

      const offspring: Offspring = {
        id: Math.random().toString(36).substr(2, 9),
        name: `${hero.name}之子`,
        rarity,
        class: hero.class,
        gender: Math.random() > 0.5 ? Gender.MALE : Gender.FEMALE,
        race: mainRace || Race.HUMAN,
        bloodlines,
        level: 1,
        exp: 0,
        maxExp: 100,
        stats: { hp: 100, maxHp: 100, atk: 20, def: 10, spd: 10, skill: 10 },
        description: "继承了强大血统的后代。",
        rating: Math.floor(Math.random() * 50) + 50,
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
          rating: o.rating + Math.floor(gain / 2)
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

  const handleExchangeCurrency = useCallback((mode: 'gem_to_gold' | 'gold_to_gem') => {
    setPlayer(prev => {
      if (mode === 'gem_to_gold') {
        if (prev.gems < 1) return prev;
        return { ...prev, gems: prev.gems - 1, gold: prev.gold + 100 };
      } else {
        if (prev.gold < 150) return prev;
        return { ...prev, gold: prev.gold - 150, gems: prev.gems + 1 };
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
      race: prisoner.race,
      bloodlines: prisoner.bloodlines,
      level: 1,
      exp: 0,
      maxExp: 100,
      stats: { ...prisoner.stats },
      description: "曾经的俘虏，现在是忠诚的伙伴。",
      rating: Math.floor(prisoner.stats.hp / 5 + prisoner.stats.atk + prisoner.stats.def + prisoner.stats.spd + prisoner.stats.skill),
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
        [Rarity.C]: 10, [Rarity.B]: 20, [Rarity.A]: 50, [Rarity.S]: 100, [Rarity.SS]: 200, [Rarity.SSS]: 500
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
        [Rarity.C]: 10, [Rarity.B]: 20, [Rarity.A]: 50, [Rarity.S]: 100, [Rarity.SS]: 200, [Rarity.SSS]: 500
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
      
      const prisoners = prev.prisoners.map(p => {
        if (p.id !== id || !p.isPregnant) return p;
        return { ...p, pregnancyEndTime: Date.now() }; // Set to now so the interval picks it up
      });

      return {
        ...prev,
        gems: prev.gems - 50,
        prisoners
      };
    });
  }, []);

  const handleSendToPrison = useCallback((id: string, type: 'hero' | 'offspring') => {
    setPlayer(prev => {
      const list = type === 'hero' ? prev.collection : prev.offsprings;
      const target = list.find(x => x.id === id);
      if (!target) return prev;

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
        affection: Math.max(0, target.affection - 50)
      };

      return {
        ...prev,
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
        let nextSubStage = prev.currentSubStage + 1;
        let nextDifficulty = prev.currentStage;
        const clearedEliteStages = [...prev.clearedEliteStages];

        if (monster.type === MonsterType.ELITE || monster.type === MonsterType.BOSS) {
          clearedEliteStages.push(`${prev.currentStage}-${prev.currentSubStage}`);
          nextDifficulty = prev.currentStage + 1;
          nextSubStage = 1;
        }

        return {
          ...prev,
          gold: prev.gold + rewards.gold,
          gems: prev.gems + rewards.gems,
          exp: prev.exp + rewards.exp,
          currentStage: nextDifficulty,
          currentSubStage: nextSubStage,
          clearedEliteStages
        };
      });
      if (player.activeHeroId) handleHeroLevelUp(player.activeHeroId, rewards.exp);
      handleCapture(monster, monster.type === MonsterType.BOSS);
    } else {
      if (monster.type === MonsterType.ELITE || monster.type === MonsterType.BOSS) {
        setPlayer(prev => ({ ...prev, currentSubStage: 1 }));
      }
      setGameState(GameState.LOBBY);
    }
  }, [player.activeHeroId, handleHeroLevelUp, handleCapture]);

  const handleSweep = useCallback((difficulty: number) => {
    setPlayer(prev => {
      let totalGold = 0;
      let totalGems = 0;
      let totalExp = 0;

      for (let i = 1; i <= 10; i++) {
        const m = generateMonster(difficulty, i);
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
  }, []);

  const handleEquipPet = useCallback((heroId: string, petId: string | null) => {
    setPlayer(prev => ({
      ...prev,
      collection: prev.collection.map(h => h.id === heroId ? { ...h, equippedPetId: petId } : h)
    }));
  }, []);

  const activeHero = player.collection.find(h => h.id === player.activeHeroId) || null;
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
          <div className="flex items-center gap-1 mr-2 px-2 py-1 bg-white/5 rounded-lg border border-white/10">
            <button 
              onClick={handleExportData}
              title="导出存档"
              className="p-1.5 hover:bg-white/10 rounded transition-colors text-white/60 hover:text-white"
            >
              <Save className="w-3.5 h-3.5" />
            </button>
            <label className="p-1.5 hover:bg-white/10 rounded transition-colors text-white/60 hover:text-white cursor-pointer">
              <Upload className="w-3.5 h-3.5" />
              <input type="file" className="hidden" onChange={handleImportData} accept=".json" />
            </label>
            <button 
              onClick={handleClearData}
              title="清除存档"
              className="p-1.5 hover:bg-red-500/20 rounded transition-colors text-red-500/60 hover:text-red-500"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
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
              currentDifficulty={player.currentStage || 1}
              selectedDifficulty={selectedDifficulty}
              onSelectDifficulty={setSelectedDifficulty}
              onNavigate={setGameState}
              onRenameHero={renameHero}
              onSweep={handleSweep}
              onManualLevelUp={handleManualLevelUp}
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
              key="battle"
              hero={activeHero!}
              difficulty={player.currentStage}
              subStage={player.currentSubStage}
              onBattleEnd={handleBattleEnd}
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
