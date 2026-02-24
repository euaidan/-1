import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Coins, Gem } from 'lucide-react';
import { Player, Pet, Rarity } from '../types';
import { cn } from '../lib/utils';

interface PetGachaScreenProps {
  player: Player;
  onSummon: (count: number) => void;
  lastSummoned: Pet[];
}

const RARITY_COLORS = {
  [Rarity.C]: 'border-slate-500/30 text-slate-400',
  [Rarity.B]: 'border-emerald-500/30 text-emerald-400',
  [Rarity.A]: 'border-purple-500/30 text-purple-400',
  [Rarity.S]: 'border-yellow-500/30 text-yellow-400',
  [Rarity.SS]: 'border-red-500/30 text-red-500',
  [Rarity.SSS]: 'border-white/30 text-white',
};

export default function PetGachaScreen({ player, onSummon, lastSummoned }: PetGachaScreenProps) {
  const [isSummoning, setIsSummoning] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const handleSummon = (count: number) => {
    const cost = count === 1 ? 500 : 4500;
    if (player.gold < cost) return;

    setIsSummoning(true);
    setShowResults(false);
    
    setTimeout(() => {
      onSummon(count);
      setIsSummoning(false);
      setShowResults(true);
    }, 1500);
  };

  return (
    <div className="h-full flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Effect */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.1),transparent_70%)]" />
      
      {!showResults && !isSummoning && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center z-10"
        >
          <div className="mb-4 inline-block p-3 rounded-full bg-emerald-500/10 border border-emerald-500/20">
            <Sparkles className="w-10 h-10 text-emerald-400" />
          </div>
          <h2 className="text-2xl font-bold mb-1 tracking-tight">宠物召唤</h2>
          <p className="text-white/40 mb-6 max-w-xs mx-auto text-xs">
            使用金币寻找忠诚的伙伴。每个宠物都有独特的个性和互动！
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <SummonButton 
              count={1} 
              cost={100} 
              currency="gold"
              onClick={() => handleSummon(1)} 
              disabled={player.gold < 100}
            />
            <SummonButton 
              count={10} 
              cost={900} 
              currency="gold"
              onClick={() => handleSummon(10)} 
              disabled={player.gold < 900}
            />
          </div>
        </motion.div>
      )}

      {isSummoning && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center z-10"
        >
          <div className="w-24 h-24 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-6" />
          <p className="text-emerald-400 font-mono animate-pulse">正在沟通自然之灵...</p>
        </motion.div>
      )}

      {showResults && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="w-full max-w-4xl z-10"
        >
          <h3 className="text-2xl font-bold mb-8 text-center">召唤结果</h3>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-12">
            {lastSummoned.map((pet, i) => (
              <motion.div
                key={pet.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={cn(
                  "p-4 rounded-2xl bg-zinc-900 border flex flex-col items-center text-center",
                  RARITY_COLORS[pet.rarity]
                )}
              >
                <div className="text-4xl mb-3">{pet.icon}</div>
                <div className="text-sm font-bold truncate w-full">{pet.name}</div>
                <div className="text-[10px] opacity-50">{pet.type}</div>
              </motion.div>
            ))}
          </div>
          <div className="text-center">
            <button 
              onClick={() => setShowResults(false)}
              className="px-8 py-3 bg-white text-black font-bold rounded-full hover:bg-white/90 transition-all"
            >
              继续召唤
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}

function SummonButton({ count, cost, currency, onClick, disabled }: { 
  count: number, 
  cost: number, 
  currency: 'gold' | 'gems',
  onClick: () => void, 
  disabled: boolean 
}) {
  return (
    <button 
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "px-4 py-2.5 rounded-2xl border flex flex-col items-center gap-1 transition-all min-w-[120px]",
        disabled 
          ? "bg-white/5 border-white/10 opacity-50 cursor-not-allowed" 
          : "bg-zinc-900 border-white/10 hover:border-emerald-500 hover:bg-zinc-800"
      )}
    >
      <div className="text-base font-bold">{count}连召唤</div>
      <div className="flex items-center gap-1.5 text-[10px] opacity-60">
        {currency === 'gold' ? <Coins className="w-3 h-3 text-yellow-400" /> : <Gem className="w-3 h-3 text-cyan-400" />}
        {cost}
      </div>
    </button>
  );
}
