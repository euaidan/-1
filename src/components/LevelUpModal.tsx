import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles, Gem, ArrowUpCircle, Trophy } from 'lucide-react';
import { Hero, Rarity, Player } from '../types';
import { cn } from '../lib/utils';

interface LevelUpModalProps {
  hero: Hero;
  player: Player;
  onClose: () => void;
  onLevelUp: (heroId: string, levels: number) => void;
  onBreakthrough: (heroId: string) => void;
}

const RARITY_INDEX: Record<Rarity, number> = {
  [Rarity.C]: 0,
  [Rarity.B]: 1,
  [Rarity.A]: 2,
  [Rarity.S]: 3,
  [Rarity.SS]: 4,
  [Rarity.SSS]: 5,
};

export default function LevelUpModal({ hero, player, onClose, onLevelUp, onBreakthrough }: LevelUpModalProps) {
  const [loading, setLoading] = useState(false);

  const getBreakthroughCost = (level: number, rarity: Rarity) => {
    const levelTier = Math.floor(level / 20);
    const rarityIndex = RARITY_INDEX[rarity];
    return (levelTier * 5) + (rarityIndex * 5);
  };

  const canLevelUp = (levels: number) => {
    if (hero.level + levels > 80) return false;
    // Check if breakthrough is needed in between
    for (let i = 1; i <= levels; i++) {
      const nextLevel = hero.level + i;
      if (nextLevel > 80) return false;
      if ((hero.level + i - 1) % 20 === 0 && (hero.level + i - 1) !== 0) {
         // If we are at 20, 40, 60, we need breakthrough to reach 21, 41, 61
         return false; 
      }
    }
    
    // Calculate total EXP needed
    let totalExpNeeded = 0;
    let currentLevel = hero.level;
    let currentMaxExp = hero.maxExp;
    for (let i = 0; i < levels; i++) {
      totalExpNeeded += (currentMaxExp - (i === 0 ? hero.exp : 0));
      currentMaxExp = Math.floor(currentMaxExp * 1.1);
      currentLevel++;
    }
    
    return player.exp >= totalExpNeeded;
  };

  const calculateExpNeeded = (levels: number) => {
    let totalExpNeeded = 0;
    let currentMaxExp = hero.maxExp;
    let currentExp = hero.exp;
    for (let i = 0; i < levels; i++) {
      totalExpNeeded += Math.max(0, currentMaxExp - currentExp);
      currentMaxExp = Math.floor(currentMaxExp * 1.1);
      currentExp = 0;
    }
    return totalExpNeeded;
  };

  const handleLevelUpClick = (levels: number) => {
    if (canLevelUp(levels)) {
      onLevelUp(hero.id, levels);
    }
  };

  const breakthroughCost = hero.isBreakthroughRequired ? getBreakthroughCost(hero.level, hero.rarity) : 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="bg-zinc-900 border border-white/10 rounded-3xl w-full max-w-md overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-gradient-to-r from-emerald-500/10 to-transparent">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/20 rounded-xl">
              <ArrowUpCircle className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold">英雄升级</h3>
              <p className="text-xs text-white/40">{hero.name} - LV.{hero.level}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Stats Preview */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/5 p-3 rounded-2xl border border-white/5">
              <div className="text-[10px] text-white/40 uppercase mb-1">当前评分</div>
              <div className="text-xl font-mono font-bold text-emerald-400">{hero.rating}</div>
            </div>
            <div className="bg-white/5 p-3 rounded-2xl border border-white/5">
              <div className="text-[10px] text-white/40 uppercase mb-1">下一级评分</div>
              <div className="text-xl font-mono font-bold text-white/60">
                {hero.level < 80 ? Math.floor(hero.rating * 1.01) : 'MAX'}
              </div>
            </div>
          </div>

          {/* EXP Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-white/40">经验值进度</span>
              <span className="font-mono">{hero.exp} / {hero.maxExp}</span>
            </div>
            <div className="h-2 bg-white/5 rounded-full overflow-hidden border border-white/10">
              <motion.div 
                className="h-full bg-emerald-500"
                initial={{ width: 0 }}
                animate={{ width: `${(hero.exp / hero.maxExp) * 100}%` }}
              />
            </div>
          </div>

          {hero.isBreakthroughRequired ? (
            <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 text-center space-y-4">
              <div className="flex flex-col items-center gap-2">
                <Gem className="w-8 h-8 text-red-400 animate-bounce" />
                <h4 className="font-bold text-red-400">需要突破</h4>
                <p className="text-xs text-white/60">达到等级上限，需要消耗钻石进行突破</p>
              </div>
              <button
                onClick={() => onBreakthrough(hero.id)}
                disabled={player.gems < breakthroughCost}
                className="w-full py-3 bg-red-500 hover:bg-red-400 disabled:opacity-50 disabled:grayscale text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2"
              >
                <Gem className="w-4 h-4" />
                消耗 {breakthroughCost} 钻石突破
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              {[1, 5, 10].map(levels => {
                const expNeeded = calculateExpNeeded(levels);
                const disabled = !canLevelUp(levels);
                return (
                  <button
                    key={levels}
                    onClick={() => handleLevelUpClick(levels)}
                    disabled={disabled}
                    className={cn(
                      "flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all",
                      disabled 
                        ? "bg-white/5 border-white/5 opacity-40 grayscale cursor-not-allowed" 
                        : "bg-emerald-500/10 border-emerald-500/30 hover:bg-emerald-500/20 hover:scale-105"
                    )}
                  >
                    <span className="text-lg font-bold">+{levels}级</span>
                    <div className="flex items-center gap-1 text-[10px] font-mono text-emerald-400">
                      <Trophy className="w-3 h-3" />
                      {expNeeded}
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          <div className="flex items-center justify-center gap-2 text-xs text-white/40">
            <Trophy className="w-3 h-3" />
            <span>当前拥有经验值: <span className="text-emerald-400 font-bold">{player.exp}</span></span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
