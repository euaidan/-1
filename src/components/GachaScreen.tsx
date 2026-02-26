import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Gem, X, Info } from 'lucide-react';
import { Player, Hero, Rarity, Race } from '../types';
import { cn } from '../lib/utils';

interface GachaScreenProps {
  player: Player;
  onSummon: (count: number, targetRace: Race) => boolean;
  onSetTargetRace: (race: Race) => void;
  lastSummoned: Hero[];
}

const RARITY_COLORS = {
  [Rarity.C]: 'border-slate-500/30 bg-slate-500/10 text-slate-400',
  [Rarity.B]: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
  [Rarity.A]: 'border-purple-500/30 bg-purple-500/10 text-purple-400',
  [Rarity.S]: 'border-yellow-500/30 bg-yellow-500/10 text-yellow-400',
  [Rarity.SS]: 'border-red-500/30 bg-red-500/10 text-red-500',
  [Rarity.SSS]: 'border-white/30 bg-white/5 text-white shadow-[0_0_10px_rgba(255,255,255,0.2)]',
};

const RARITY_LABELS = {
  [Rarity.C]: 'C级',
  [Rarity.B]: 'B级',
  [Rarity.A]: 'A级',
  [Rarity.S]: 'S级',
  [Rarity.SS]: 'SS级',
  [Rarity.SSS]: 'SSS级',
};

export default function GachaScreen({ player, onSummon, onSetTargetRace, lastSummoned }: GachaScreenProps) {
  const [isSummoning, setIsSummoning] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const handleSummonClick = (count: number) => {
    if (onSummon(count, player.targetRace)) {
      setIsSummoning(true);
      setShowResults(false);
      setTimeout(() => {
        setIsSummoning(false);
        setShowResults(true);
      }, 2000);
    }
  };

  const specialRaces = [
    Race.ELF, Race.ANGEL, Race.DEMON, Race.MERMAID, Race.VAMPIRE, Race.FOX, Race.CAT
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="h-full flex flex-col items-center justify-center p-6 relative"
    >
      {/* Background Effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-emerald-500/5 rounded-full blur-[120px]" />
      </div>

      <AnimatePresence mode="wait">
        {!isSummoning && !showResults && (
          <motion.div 
            key="summon-menu"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center z-10"
          >
            <div className="mb-4">
              <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center border border-emerald-500/50 mx-auto mb-3">
                <Sparkles className="w-8 h-8 text-emerald-400" />
              </div>
              <h2 className="text-2xl font-bold mb-1 tracking-tight">远古祭坛</h2>
              <p className="text-white/40 text-xs">消耗宝石，呼唤传奇英雄降临</p>
            </div>

            <div className="mb-6">
              <div className="text-[10px] text-white/40 font-mono uppercase mb-2">指定血统 (保底: {100 - player.pityCount}抽)</div>
              <div className="flex flex-wrap justify-center gap-2 max-w-md mx-auto">
                {specialRaces.map(race => (
                  <button
                    key={race}
                    onClick={() => onSetTargetRace(race)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg border text-xs font-bold transition-all",
                      player.targetRace === race 
                        ? "bg-emerald-500 border-emerald-400 text-black" 
                        : "bg-white/5 border-white/10 text-white/60 hover:text-white"
                    )}
                  >
                    {race}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <SummonButton 
                count={1} 
                cost={100} 
                onClick={() => handleSummonClick(1)} 
                disabled={player.gems < 100}
                label="单次召唤"
              />
              <SummonButton 
                count={10} 
                cost={900} 
                onClick={() => handleSummonClick(10)} 
                disabled={player.gems < 900}
                highlight
                label="十连召唤"
              />
            </div>
          </motion.div>
        )}

        {isSummoning && (
          <motion.div 
            key="summoning-anim"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center z-10"
          >
            <motion.div 
              animate={{ 
                rotate: 360,
                scale: [1, 1.2, 1],
              }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-32 h-32 border-4 border-emerald-500 border-t-transparent rounded-full mb-8"
            />
            <h3 className="text-2xl font-mono font-bold animate-pulse">正在召唤中...</h3>
          </motion.div>
        )}

        {showResults && (
          <motion.div 
            key="results"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-5xl z-10"
          >
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-bold">召唤结果</h3>
              <button 
                onClick={() => setShowResults(false)}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
              {lastSummoned.map((hero, idx) => (
                <motion.div
                  key={hero.id}
                  initial={{ opacity: 0, scale: 0.5, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className={cn(
                    "rounded-2xl border p-4 flex flex-col items-center text-center transition-all hover:scale-105",
                    RARITY_COLORS[hero.rarity]
                  )}
                >
                  <div className="w-full aspect-square rounded-xl overflow-hidden mb-3 border border-white/10 bg-zinc-800 flex items-center justify-center">
                    <span className="text-4xl font-bold opacity-20">{hero.name[0]}</span>
                  </div>
                  <div className="text-[10px] font-mono font-bold uppercase mb-1">
                    {RARITY_LABELS[hero.rarity]} | {hero.race}
                  </div>
                  <div className="text-sm font-bold truncate w-full">{hero.name}</div>
                  <div className="mt-1 text-[10px] text-white/40 line-clamp-2 italic">"{hero.description}"</div>
                  <div className="mt-2 flex flex-col gap-1 w-full">
                    <div className="flex items-center justify-between text-[9px] text-white/40">
                      <span>血统:</span>
                      <span className="text-emerald-400 font-bold">
                        {hero.bloodlines.find(b => b.race !== Race.HUMAN)?.purity || 0}%
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-white/60">
                        {hero.gender}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold">
                        评分: {hero.rating}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="mt-12 flex justify-center">
              <button 
                onClick={() => setShowResults(false)}
                className="px-12 py-4 bg-white text-black font-bold rounded-full hover:bg-white/90 transition-all"
              >
                确认
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function SummonButton({ count, cost, onClick, disabled, highlight, label }: { 
  count: number, 
  cost: number, 
  onClick: () => void,
  disabled?: boolean,
  highlight?: boolean,
  label: string
}) {
  return (
    <button 
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "px-4 py-3 rounded-2xl border flex flex-col items-center gap-1 transition-all min-w-[140px]",
        highlight 
          ? "bg-emerald-500 border-emerald-400 text-black hover:bg-emerald-400" 
          : "bg-zinc-900 border-white/10 hover:bg-zinc-800",
        disabled && "opacity-50 cursor-not-allowed grayscale"
      )}
    >
      <div className="text-[9px] font-mono font-bold uppercase opacity-60">{label}</div>
      <div className="flex items-center gap-1">
        <Gem className="w-3.5 h-3.5" />
        <span className="text-lg font-mono font-bold">{cost}</span>
      </div>
    </button>
  );
}
