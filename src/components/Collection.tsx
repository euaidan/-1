import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Player, Hero, Rarity, Pet, Race, Offspring } from '../types';
import { cn } from '../lib/utils';
import { Users, Heart, Sword, Shield, Zap, CheckCircle2, Edit2, Check, X, Sparkles, Baby, GraduationCap, Dna } from 'lucide-react';

import HeroAvatar from './HeroAvatar';

interface CollectionProps {
  player: Player;
  onSelectHero: (id: string) => void;
  onSelectPet: (id: string) => void;
  onRenameHero: (id: string, name: string) => void;
  onEquipPet: (heroId: string, petId: string | null) => void;
  onTrainOffspring: (id: string) => void;
  onChangePlayerBloodline: (id: string) => void;
}

const RARITY_COLORS = {
  [Rarity.C]: 'border-slate-500/30 text-slate-400',
  [Rarity.B]: 'border-emerald-500/30 text-emerald-400',
  [Rarity.A]: 'border-purple-500/30 text-purple-400',
  [Rarity.S]: 'border-yellow-500/30 text-yellow-400',
  [Rarity.SS]: 'border-red-500/30 text-red-500',
  [Rarity.SSS]: 'border-white/30 text-white shadow-[0_0_10px_rgba(255,255,255,0.2)]',
};

const RARITY_LABELS = {
  [Rarity.C]: 'C级',
  [Rarity.B]: 'B级',
  [Rarity.A]: 'A级',
  [Rarity.S]: 'S级',
  [Rarity.SS]: 'SS级',
  [Rarity.SSS]: 'SSS级',
};

export default function Collection({ 
  player, 
  onSelectHero, 
  onSelectPet, 
  onRenameHero, 
  onEquipPet,
  onTrainOffspring,
  onChangePlayerBloodline
}: CollectionProps) {
  const [tab, setTab] = useState<'heroes' | 'pets' | 'offsprings'>('heroes');

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="h-full p-3 flex flex-col gap-3"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-lg sm:text-xl font-bold tracking-tight">收藏馆</h2>
          <p className="text-white/40 text-[9px] sm:text-[10px]">管理你的英雄与伙伴</p>
        </div>
        <div className="flex bg-zinc-900 rounded-xl p-1 border border-white/10 w-full sm:w-auto">
          <button 
            onClick={() => setTab('heroes')}
            className={cn(
              "flex-1 sm:flex-none px-4 sm:px-6 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all",
              tab === 'heroes' ? "bg-emerald-500 text-black" : "text-white/40 hover:text-white"
            )}
          >
            英雄 ({player.collection.length})
          </button>
          <button 
            onClick={() => setTab('pets')}
            className={cn(
              "flex-1 sm:flex-none px-4 sm:px-6 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all",
              tab === 'pets' ? "bg-emerald-500 text-black" : "text-white/40 hover:text-white"
            )}
          >
            宠物 ({player.petCollection.length})
          </button>
          <button 
            onClick={() => setTab('offsprings')}
            className={cn(
              "flex-1 sm:flex-none px-4 sm:px-6 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all",
              tab === 'offsprings' ? "bg-emerald-500 text-black" : "text-white/40 hover:text-white"
            )}
          >
            子嗣 ({player.offsprings.length})
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-2">
        {tab === 'heroes' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {player.collection.map((hero) => (
              <HeroCard 
                key={hero.id}
                hero={hero}
                isActive={player.activeHeroId === hero.id}
                pets={player.petCollection}
                onClick={() => onSelectHero(hero.id)}
                onRename={(name) => onRenameHero(hero.id, name)}
                onEquipPet={(petId) => onEquipPet(hero.id, petId)}
              />
            ))}
            
            {player.collection.length === 0 && (
              <div className="col-span-full h-48 border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center text-white/20">
                <Users className="w-10 h-10 mb-3" />
                <p className="text-sm">你的英雄收藏空空如也。</p>
              </div>
            )}
          </div>
        ) : tab === 'pets' ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
            {player.petCollection.map((pet) => (
              <PetCard 
                key={pet.id}
                pet={pet}
                isActive={player.activePetId === pet.id}
                onClick={() => onSelectPet(pet.id)}
              />
            ))}
            
            {player.petCollection.length === 0 && (
              <div className="col-span-full h-64 border-2 border-dashed border-white/10 rounded-3xl flex flex-col items-center justify-center text-white/20">
                <Sparkles className="w-12 h-12 mb-4" />
                <p>你还没有任何宠物伙伴。</p>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {player.offsprings.map((offspring) => (
              <OffspringCard 
                key={offspring.id}
                offspring={offspring}
                isActive={player.activeHeroId === offspring.id}
                onSelect={() => onSelectHero(offspring.id)}
                onTrain={() => onTrainOffspring(offspring.id)}
                onChangeBloodline={() => onChangePlayerBloodline(offspring.id)}
              />
            ))}
            
            {player.offsprings.length === 0 && (
              <div className="col-span-full h-48 border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center text-white/20">
                <Baby className="w-10 h-10 mb-3" />
                <p className="text-sm">还没有子嗣降临。</p>
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}

function PetCard({ pet, isActive, onClick }: { pet: Pet, isActive: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "p-4 rounded-2xl border bg-zinc-900/50 flex flex-col items-center text-center transition-all hover:bg-zinc-800 relative",
        isActive ? "border-emerald-500 ring-1 ring-emerald-500" : "border-white/10",
        RARITY_COLORS[pet.rarity]
      )}
    >
      <div className="text-4xl mb-3">{pet.icon}</div>
      <div className="text-sm font-bold truncate w-full mb-1">{pet.name}</div>
      <div className="text-[10px] opacity-50">{pet.type}</div>
      {isActive && (
        <div className="absolute -top-2 -right-2 bg-emerald-500 text-black text-[8px] font-bold px-1.5 py-0.5 rounded-full">
          跟随中
        </div>
      )}
    </button>
  );
}

function HeroCard({ hero, isActive, pets, onClick, onRename, onEquipPet }: { 
  hero: Hero, 
  isActive: boolean, 
  pets: Pet[],
  onClick: () => void, 
  onRename: (name: string) => void,
  onEquipPet: (petId: string | null) => void 
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState(hero.name);
  const [showPetSelect, setShowPetSelect] = useState(false);

  const equippedPet = pets.find(p => p.id === hero.equippedPetId);

  const handleRename = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (tempName.trim()) {
      onRename(tempName.trim());
      setIsEditing(false);
    }
  };

  return (
    <div className={cn(
      "group relative rounded-2xl border bg-zinc-900/50 p-4 text-left transition-all hover:bg-zinc-800 flex flex-col",
      isActive ? "border-emerald-500 ring-1 ring-emerald-500" : "border-white/10",
      RARITY_COLORS[hero.rarity]
    )}>
      <div className="flex gap-3">
        <div className="relative w-16 h-16 flex-shrink-0">
          <HeroAvatar name={hero.name} rarity={hero.rarity} size="md" className="w-16 h-16" />
          {equippedPet && (
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-zinc-800 border border-white/10 flex items-center justify-center text-sm shadow-lg">
              {equippedPet.icon}
            </div>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start">
            <div className="text-[9px] font-mono font-bold uppercase tracking-wider opacity-60">
              {RARITY_LABELS[hero.rarity]} | {hero.race}
            </div>
            <div className="flex gap-1">
              <button 
                onClick={(e) => { e.stopPropagation(); setShowPetSelect(!showPetSelect); }}
                className="p-1 hover:bg-emerald-500/20 rounded text-emerald-400"
              >
                <Sparkles className="w-3 h-3" />
              </button>
              {isActive && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
            </div>
          </div>
          
          {isEditing ? (
            <div className="flex items-center gap-1 mt-0.5" onClick={e => e.stopPropagation()}>
              <input 
                autoFocus
                value={tempName}
                onChange={e => setTempName(e.target.value)}
                className="bg-black/40 border border-white/20 rounded px-1 py-0.5 text-xs font-bold w-full outline-none"
                onKeyDown={e => e.key === 'Enter' && handleRename(e as any)}
              />
              <button onClick={handleRename} className="p-1 text-emerald-400 hover:bg-emerald-400/10 rounded">
                <Check className="w-2.5 h-2.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 group/name mt-0.5">
              <h3 className="text-base font-bold text-white truncate" onClick={onClick}>{hero.name}</h3>
              <button 
                onClick={(e) => { e.stopPropagation(); setIsEditing(true); }}
                className="opacity-0 group-hover/name:opacity-100 p-1 hover:bg-white/10 rounded transition-all"
              >
                <Edit2 className="w-2.5 h-2.5 text-white/40" />
              </button>
            </div>
          )}

          <div className="flex flex-col gap-1 mt-2">
            <div className="text-[8px] text-white/40 font-mono uppercase">血统</div>
            <div className="flex flex-wrap gap-1">
              {hero.bloodlines?.map((b, i) => (
                <div key={i} className="px-1 py-0.5 bg-white/5 rounded border border-white/10 text-[8px]">
                  <span className="text-white/60">{b.race}:</span>
                  <span className="ml-0.5 font-bold text-emerald-400">{b.purity}%</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between mt-1">
            <span className="text-[10px] text-white/40">评分: {hero.rating}</span>
            <span className="text-[10px] text-white/40">好感: {hero.affection}</span>
          </div>
        </div>
      </div>

      {/* Pet Selection Overlay */}
      <AnimatePresence>
        {showPetSelect && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute inset-0 z-30 bg-black/95 p-3 flex flex-col rounded-2xl"
          >
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-white/40">装备宠物</h4>
              <button onClick={() => setShowPetSelect(false)}><X className="w-3 h-3" /></button>
            </div>
            <div className="flex-1 overflow-y-auto grid grid-cols-3 gap-1.5">
              <button 
                onClick={() => { onEquipPet(null); setShowPetSelect(false); }}
                className="aspect-square rounded-lg border border-white/10 flex flex-col items-center justify-center text-[8px] hover:bg-white/5"
              >
                <X className="w-3 h-3 mb-1" />
                卸下
              </button>
              {pets.map(pet => (
                <button 
                  key={pet.id}
                  onClick={() => { onEquipPet(pet.id); setShowPetSelect(false); }}
                  className={cn(
                    "aspect-square rounded-lg border flex flex-col items-center justify-center text-[8px] hover:bg-white/5",
                    hero.equippedPetId === pet.id ? "border-emerald-500 bg-emerald-500/10" : "border-white/10"
                  )}
                >
                  <span className="text-lg mb-0.5">{pet.icon}</span>
                  <span className="truncate w-full px-0.5">{pet.name}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-4 grid grid-cols-4 gap-2">
        <MiniStat icon={<Heart className="w-3 h-3" />} value={hero.stats.hp} bonus={equippedPet?.bonus.hp} />
        <MiniStat icon={<Sword className="w-3 h-3" />} value={hero.stats.atk} bonus={equippedPet?.bonus.atk} />
        <MiniStat icon={<Shield className="w-3 h-3" />} value={hero.stats.def} bonus={equippedPet?.bonus.def} />
        <MiniStat icon={<Zap className="w-3 h-3" />} value={hero.stats.spd} bonus={equippedPet?.bonus.spd} />
      </div>

      {isActive && (
        <div className="absolute -top-2 -right-2 bg-emerald-500 text-black text-[10px] font-bold px-2 py-1 rounded-full shadow-lg">
          出战中
        </div>
      )}
      {hero.isBreeding && (
        <div className="absolute -top-2 -left-2 bg-pink-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-lg animate-pulse">
          孕育中
        </div>
      )}
    </div>
  );
}

function OffspringCard({ offspring, isActive, onSelect, onTrain, onChangeBloodline }: { 
  offspring: Offspring, 
  isActive: boolean,
  onSelect: () => void,
  onTrain: () => void,
  onChangeBloodline: () => void
}) {
  return (
    <div className={cn(
      "group relative rounded-2xl border bg-zinc-900/50 p-4 text-left transition-all hover:bg-zinc-800 flex flex-col",
      isActive ? "border-emerald-500 ring-1 ring-emerald-500" : "border-white/10",
      RARITY_COLORS[offspring.rarity]
    )}>
      <div className="flex gap-3">
        <HeroAvatar name={offspring.name} rarity={offspring.rarity} size="md" className="w-16 h-16" />
        <div className="flex-1 min-w-0">
          <div className="text-[9px] font-mono font-bold uppercase tracking-wider opacity-60">
            {RARITY_LABELS[offspring.rarity]} | {offspring.race}
          </div>
          <h3 className="text-base font-bold text-white truncate">{offspring.name}</h3>
          
          <div className="flex flex-col gap-1 mt-2">
            <div className="text-[8px] text-white/40 font-mono uppercase">血统</div>
            <div className="flex flex-wrap gap-1">
              {offspring.bloodlines?.map((b, i) => (
                <div key={i} className="px-1 py-0.5 bg-white/5 rounded border border-white/10 text-[8px]">
                  <span className="text-white/60">{b.race}:</span>
                  <span className="ml-0.5 font-bold text-emerald-400">{b.purity}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        {!offspring.isAdult ? (
          <button 
            onClick={onTrain}
            className="col-span-2 flex items-center justify-center gap-2 py-2 rounded-xl bg-emerald-500 text-black font-bold text-xs hover:bg-emerald-400"
          >
            <GraduationCap className="w-4 h-4" /> 培养 ({offspring.trainingCount}/10)
          </button>
        ) : (
          <>
            <button 
              onClick={onSelect}
              className="flex items-center justify-center gap-2 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-bold hover:bg-white/10"
            >
              <Users className="w-4 h-4" /> {isActive ? '已出战' : '出战'}
            </button>
            <button 
              onClick={onChangeBloodline}
              className="flex items-center justify-center gap-2 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-bold hover:bg-white/10"
            >
              <Dna className="w-4 h-4" /> 继承血统
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function MiniStat({ icon, value, bonus }: { icon: React.ReactNode, value: number, bonus?: number }) {
  return (
    <div className="flex flex-col items-center gap-1 bg-black/20 rounded-lg py-1.5 border border-white/5">
      <div className="opacity-40">{icon}</div>
      <div className="text-[10px] font-mono font-bold text-white/80">
        {value}
        {bonus && <span className="text-emerald-400 block">+{bonus}</span>}
      </div>
    </div>
  );
}
