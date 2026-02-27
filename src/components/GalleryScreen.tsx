import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Book, X, Search, Filter, Sparkles, User, Info } from 'lucide-react';
import { Player, Hero, Rarity, Race, Gender } from '@/types';
import { FIXED_HEROES } from '@/constants';
import { cn } from '@/lib/utils';
import HeroAvatar from './HeroAvatar';

interface GalleryScreenProps {
  player: Player;
  onClose: () => void;
}

const RARITY_COLORS = {
  [Rarity.SSS]: 'border-white/30 bg-white/5 text-white shadow-[0_0_10px_rgba(255,255,255,0.2)]',
  [Rarity.SP]: 'border-purple-500/50 bg-purple-500/10 text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.4)]',
};

export default function GalleryScreen({ player, onClose }: GalleryScreenProps) {
  const [selectedRace, setSelectedRace] = useState<Race | 'ALL'>('ALL');
  const [selectedRarity, setSelectedRarity] = useState<Rarity | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedHero, setSelectedHero] = useState<typeof FIXED_HEROES[0] | null>(null);

  const filteredHeroes = FIXED_HEROES
    .filter(hero => {
      if (selectedRace !== 'ALL' && hero.race !== selectedRace) return false;
      if (selectedRarity !== 'ALL' && hero.rarity !== selectedRarity) return false;
      if (searchQuery && !hero.name.includes(searchQuery)) return false;
      return true;
    })
    .sort((a, b) => {
      if (a.rarity === b.rarity) return 0;
      return a.rarity === Rarity.SP ? -1 : 1;
    });

  const isCollected = (name: string) => {
    return player.collection.some(h => h.name === name) || player.offsprings.some(o => o.name === name);
  };

  const collectedCount = FIXED_HEROES.filter(h => isCollected(h.name)).length;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black flex flex-col"
    >
      {/* Header */}
      <div className="p-4 lg:p-6 border-b border-white/10 flex items-center justify-between bg-zinc-900/50 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-emerald-500/20 rounded-2xl border border-emerald-500/30">
            <Book className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">传奇图鉴</h2>
            <p className="text-xs text-white/40">已收录: <span className="text-emerald-400 font-bold">{collectedCount}</span> / {FIXED_HEROES.length}</p>
          </div>
        </div>
        <button 
          onClick={onClose}
          className="p-3 hover:bg-white/5 rounded-full transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Filters */}
        <div className="w-64 border-r border-white/10 p-6 hidden lg:flex flex-col gap-8 bg-zinc-900/30">
          <div>
            <h3 className="text-[10px] font-mono font-bold uppercase text-white/40 mb-4 tracking-widest">搜索英雄</h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
              <input 
                type="text"
                placeholder="输入英雄名称..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-emerald-500/50 transition-all"
              />
            </div>
          </div>

          <div>
            <h3 className="text-[10px] font-mono font-bold uppercase text-white/40 mb-4 tracking-widest">按种族筛选</h3>
            <div className="flex flex-col gap-2">
              <FilterButton 
                active={selectedRace === 'ALL'} 
                onClick={() => setSelectedRace('ALL')}
                label="全部种族"
              />
              {Object.values(Race).map(race => (
                <FilterButton 
                  key={race}
                  active={selectedRace === race} 
                  onClick={() => setSelectedRace(race)}
                  label={race}
                />
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-[10px] font-mono font-bold uppercase text-white/40 mb-4 tracking-widest">按稀有度筛选</h3>
            <div className="flex flex-col gap-2">
              <FilterButton 
                active={selectedRarity === 'ALL'} 
                onClick={() => setSelectedRarity('ALL')}
                label="全部稀有度"
              />
              <FilterButton 
                active={selectedRarity === Rarity.SSS} 
                onClick={() => setSelectedRarity(Rarity.SSS)}
                label="SSS级"
              />
              <FilterButton 
                active={selectedRarity === Rarity.SP} 
                onClick={() => setSelectedRarity(Rarity.SP)}
                label="SP级"
              />
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-3 lg:gap-4">
            {filteredHeroes.map((hero, idx) => {
              const collected = isCollected(hero.name);
              return (
                <motion.div
                  key={hero.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.01 }}
                  onClick={() => setSelectedHero(hero)}
                  className={cn(
                    "group relative aspect-[3/4] rounded-xl border transition-all cursor-pointer overflow-hidden",
                    collected 
                      ? RARITY_COLORS[hero.rarity as keyof typeof RARITY_COLORS]
                      : "border-white/5 bg-zinc-900/50 grayscale opacity-40 hover:opacity-60",
                    "hover:scale-105 active:scale-95"
                  )}
                >
                  {/* Card Content */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-3">
                    <div className="w-12 h-12 lg:w-16 lg:h-16 rounded-full bg-zinc-800 border border-white/10 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                      <span className="text-2xl lg:text-3xl font-bold opacity-20">{hero.name[0]}</span>
                    </div>
                    <div className="text-[8px] font-mono font-bold uppercase mb-0.5 opacity-60">
                      {hero.rarity} | {hero.race}
                    </div>
                    <div className="text-xs lg:text-sm font-bold text-center">{hero.name}</div>
                    <div className="mt-1 text-[8px] px-1.5 py-0.25 rounded-full bg-white/5 border border-white/10">
                      {hero.gender}
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className={cn(
                    "absolute top-2 right-2 px-2 py-0.5 rounded text-[8px] font-bold uppercase",
                    collected ? "bg-emerald-500 text-black" : "bg-white/10 text-white/40"
                  )}>
                    {collected ? "已收录" : "未获得"}
                  </div>

                  {/* SP Glow */}
                  {hero.rarity === Rarity.SP && collected && (
                    <div className="absolute inset-0 bg-gradient-to-t from-purple-500/20 to-transparent pointer-events-none" />
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Hero Detail Modal */}
      <AnimatePresence>
        {selectedHero && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm"
            onClick={() => setSelectedHero(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-zinc-900 border border-white/10 rounded-3xl w-full max-w-2xl overflow-hidden flex flex-col md:flex-row"
              onClick={e => e.stopPropagation()}
            >
              {/* Left Side: Visual */}
              <div className={cn(
                "w-full md:w-1/2 aspect-square md:aspect-auto bg-zinc-800 flex items-center justify-center relative overflow-hidden",
                selectedHero.rarity === Rarity.SP && "bg-gradient-to-br from-purple-900/20 to-zinc-800"
              )}>
                <div className="text-9xl font-bold opacity-10 select-none">{selectedHero.name[0]}</div>
                <div className="absolute inset-0 flex items-center justify-center">
                   <HeroAvatar name={selectedHero.name} rarity={selectedHero.rarity as Rarity} size="lg" />
                </div>
                {selectedHero.rarity === Rarity.SP && (
                  <motion.div 
                    animate={{ opacity: [0.3, 0.6, 0.3] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute inset-0 bg-purple-500/10 blur-3xl rounded-full"
                  />
                )}
              </div>

              {/* Right Side: Info */}
              <div className="flex-1 p-6 lg:p-8 flex flex-col">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <div className={cn(
                      "text-xs font-mono font-bold uppercase mb-1",
                      selectedHero.rarity === Rarity.SP ? "text-purple-400" : "text-white/60"
                    )}>
                      {selectedHero.rarity}级 | {selectedHero.race} | {selectedHero.gender}
                    </div>
                    <h3 className="text-3xl font-bold tracking-tight">{selectedHero.name}</h3>
                  </div>
                  <button 
                    onClick={() => setSelectedHero(null)}
                    className="p-2 hover:bg-white/5 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-6 flex-1">
                  <div>
                    <h4 className="text-[10px] font-mono font-bold uppercase text-white/40 mb-2 tracking-widest">个人介绍</h4>
                    <p className="text-sm text-white/80 leading-relaxed italic">
                      "{selectedHero.description}"
                    </p>
                  </div>

                  <div className="pt-6 border-t border-white/5">
                    <div className="flex items-center gap-2 text-xs text-white/40">
                      <Info className="w-3 h-3" />
                      <span>{isCollected(selectedHero.name) ? "已在您的收藏中" : "尚未获得该英雄"}</span>
                    </div>
                  </div>
                </div>

                {!isCollected(selectedHero.name) && (
                  <div className="mt-8 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center gap-3">
                    <Sparkles className="w-5 h-5 text-emerald-400" />
                    <p className="text-xs text-emerald-400/80">可通过远古祭坛召唤获得此英雄</p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function FilterButton({ active, onClick, label }: { active: boolean, onClick: () => void, label: string }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-4 py-2 rounded-xl text-sm font-bold transition-all text-left",
        active 
          ? "bg-emerald-500 text-black" 
          : "bg-white/5 text-white/60 hover:text-white hover:bg-white/10"
      )}
    >
      {label}
    </button>
  );
}
