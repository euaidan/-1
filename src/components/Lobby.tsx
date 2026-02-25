import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Sword, Sparkles, Users, Play, Shield, Zap, Heart, Edit2, Check, X, Skull, ShoppingBag } from 'lucide-react';
import { GameState, Player, Hero, Rarity, Pet } from '../types';
import { cn } from '../lib/utils';
import PetWidget from './PetWidget';
import HeroAvatar from './HeroAvatar';

interface LobbyProps {
  player: Player;
  activeHero: Hero | null;
  activePet: Pet | null;
  currentDifficulty: number;
  selectedDifficulty: number;
  onSelectDifficulty: (difficulty: number) => void;
  onNavigate: (state: GameState) => void;
  onRenameHero: (id: string, name: string) => void;
  onSweep: (difficulty: number) => void;
  onManualLevelUp: (id: string) => void;
}

const RARITY_COLORS = {
  [Rarity.C]: 'text-slate-400',
  [Rarity.B]: 'text-emerald-400',
  [Rarity.A]: 'text-purple-400',
  [Rarity.S]: 'text-yellow-400',
  [Rarity.SS]: 'text-red-500',
  [Rarity.SSS]: 'text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-yellow-500 via-emerald-500 via-blue-500 to-purple-500 animate-gradient',
};

const RARITY_LABELS = {
  [Rarity.C]: 'C级',
  [Rarity.B]: 'B级',
  [Rarity.A]: 'A级',
  [Rarity.S]: 'S级',
  [Rarity.SS]: 'SS级',
  [Rarity.SSS]: 'SSS级',
};

export default function Lobby({ 
  player, 
  activeHero, 
  activePet, 
  currentDifficulty,
  selectedDifficulty,
  onSelectDifficulty,
  onNavigate, 
  onRenameHero,
  onSweep,
  onManualLevelUp
}: LobbyProps) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState(activeHero?.name || '');

  const handleRename = () => {
    if (activeHero && newName.trim()) {
      onRenameHero(activeHero.id, newName.trim());
      setIsEditingName(false);
    }
  };

  const isBreeding = activeHero?.isBreeding;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="h-full flex flex-col md:flex-row p-3 gap-3"
    >
      {/* Left Side: Hero Display */}
      <div className="flex-1 relative group min-h-[300px] md:min-h-0">
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10" />
        {activeHero ? (
          <div className="h-full rounded-3xl overflow-hidden border border-white/10 bg-zinc-900/50 flex flex-col">
            <div className="relative flex-1 flex flex-col p-4 z-20">
              {/* Pet Overlay */}
              <div className="absolute top-4 right-4 z-30">
                {activePet && <PetWidget pet={activePet} />}
              </div>

              <div className={cn("text-xs font-mono font-bold uppercase tracking-[0.2em] mb-2", RARITY_COLORS[activeHero.rarity])}>
                {RARITY_LABELS[activeHero.rarity]} {activeHero.race}
              </div>
                
              <div className="flex items-center gap-2 sm:gap-4 mb-2 sm:mb-4">
                {isEditingName ? (
                  <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md p-1 sm:p-2 rounded-xl border border-white/20">
                    <input 
                      autoFocus
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="bg-transparent border-none outline-none text-xl sm:text-3xl font-bold w-32 sm:w-48"
                      onKeyDown={(e) => e.key === 'Enter' && handleRename()}
                    />
                    <button onClick={handleRename} className="p-1 hover:bg-emerald-500/20 rounded-lg text-emerald-400">
                      <Check className="w-5 h-5 sm:w-6 sm:h-6" />
                    </button>
                    <button onClick={() => setIsEditingName(false)} className="p-1 hover:bg-red-500/20 rounded-lg text-red-400">
                      <X className="w-5 h-5 sm:w-6 sm:h-6" />
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 group/name">
                    <div className="flex items-center gap-2">
                      <h2 className="text-2xl sm:text-5xl font-bold tracking-tight truncate max-w-[150px] sm:max-w-none">{activeHero.name}</h2>
                      <button 
                        onClick={() => {
                          setNewName(activeHero.name);
                          setIsEditingName(true);
                        }}
                        className="p-1 sm:p-1.5 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 opacity-0 group-hover/name:opacity-100 transition-all"
                      >
                        <Edit2 className="w-3 h-3 sm:w-4 sm:h-4 text-white/60" />
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => onManualLevelUp(activeHero.id)}
                        disabled={activeHero.level >= 80}
                        className={cn(
                          "px-2 py-0.5 border rounded text-[10px] font-bold transition-all",
                          activeHero.isBreakthroughRequired 
                            ? "bg-red-500/20 text-red-400 border-red-500/30 animate-pulse" 
                            : "bg-emerald-500/20 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/40"
                        )}
                      >
                        {activeHero.isBreakthroughRequired ? `突破 (需${activeHero.level * 100}金币)` : `LV.${activeHero.level}`}
                      </button>
                      <div className="w-24 sm:w-32 h-1.5 bg-white/10 rounded-full overflow-hidden border border-white/5">
                        <motion.div 
                          className="h-full bg-emerald-500"
                          initial={{ width: 0 }}
                          animate={{ width: `${(activeHero.exp / activeHero.maxExp) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-2 mb-4">
                <div className="text-[10px] text-white/40 font-mono uppercase">血统纯度</div>
                <div className="flex flex-wrap gap-2">
                  {activeHero.bloodlines?.map((b, i) => (
                    <div key={i} className="px-2 py-1 bg-white/5 rounded-lg border border-white/10 text-[10px]">
                      <span className="text-white/60">{b.race}:</span>
                      <span className="ml-1 font-bold text-emerald-400">{b.purity}%</span>
                    </div>
                  ))}
                </div>
              </div>

              <p className="text-white/60 text-xs sm:text-sm max-w-md mb-4 sm:mb-6 line-clamp-2 sm:line-clamp-none">{activeHero.description}</p>
              
              <div className="grid grid-cols-4 gap-2 mt-auto">
                <StatBox icon={<Heart className="w-3 h-3 sm:w-4 sm:h-4 text-red-400" />} label="生命" value={activeHero.stats.hp} />
                <StatBox icon={<Sword className="w-3 h-3 sm:w-4 sm:h-4 text-orange-400" />} label="攻击" value={activeHero.stats.atk} />
                <StatBox icon={<Shield className="w-3 h-3 sm:w-4 sm:h-4 text-blue-400" />} label="防御" value={activeHero.stats.def} />
                <StatBox icon={<Zap className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400" />} label="速度" value={activeHero.stats.spd} />
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full rounded-3xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center text-center p-8 bg-white/5">
            <Users className="w-12 h-12 text-white/20 mb-4" />
            <h3 className="text-lg font-bold mb-2">未选择英雄</h3>
            <p className="text-white/40 mb-4">召唤你的第一个英雄开始冒险吧！</p>
            <button 
              onClick={() => onNavigate(GameState.GACHA)}
              className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-full transition-all hover:scale-105"
            >
              前往召唤
            </button>
          </div>
        )}
      </div>

      {/* Right Side: Navigation */}
      <div className="w-full md:w-80 flex flex-col gap-2 overflow-y-auto pr-2">
        {/* Stage Selector */}
        <div className="bg-zinc-900 border border-white/10 rounded-2xl p-3 mb-2">
          <div className="text-[10px] text-white/40 font-mono uppercase mb-2">难度选择</div>
          <div className="flex items-center justify-between gap-2">
            <button 
              onClick={() => onSelectDifficulty(Math.max(1, selectedDifficulty - 1))}
              className="p-2 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10"
            >
              <X className="w-4 h-4 rotate-45" />
            </button>
            <div className="flex-1 text-center">
              <div className="text-lg font-bold font-mono">难度 {selectedDifficulty}</div>
              <div className="text-[9px] text-white/40">当前进度: {player.currentSubStage}/11</div>
            </div>
            <button 
              onClick={() => onSelectDifficulty(Math.min(currentDifficulty, selectedDifficulty + 1))}
              className="p-2 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10"
            >
              <Play className="w-4 h-4" />
            </button>
          </div>
          <input 
            type="range" 
            min="1" 
            max={currentDifficulty} 
            value={selectedDifficulty} 
            onChange={(e) => onSelectDifficulty(parseInt(e.target.value))}
            className="w-full mt-3 accent-emerald-500"
          />
          <button 
            onClick={() => onSweep(selectedDifficulty)}
            className="w-full mt-3 py-2 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-500 border border-yellow-500/30 rounded-xl text-xs font-bold transition-all"
          >
            扫荡普通关卡 (1-10)
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <NavButton 
            icon={<Play className="w-6 h-6" />}
            title="战斗"
            description={isBreeding ? "孕育中不可战斗" : `挑战关卡 ${player.currentSubStage}`}
            onClick={() => activeHero && !isBreeding && onNavigate(GameState.BATTLE)}
            disabled={!activeHero || isBreeding}
            primary
          />
          <NavButton 
            icon={<Heart className="w-6 h-6" />}
            title="互动"
            description="培养感情"
            onClick={() => activeHero && onNavigate(GameState.INTERACTION)}
            disabled={!activeHero}
          />
          <NavButton 
            icon={<Sparkles className="w-6 h-6" />}
            title="英雄召唤"
            description="呼唤英雄"
            onClick={() => onNavigate(GameState.GACHA)}
          />
          <NavButton 
            icon={<Sparkles className="w-6 h-6 text-emerald-400" />}
            title="宠物召唤"
            description="寻找伙伴"
            onClick={() => onNavigate(GameState.PET_GACHA)}
          />
          <NavButton 
            icon={<Skull className="w-6 h-6 text-red-400" />}
            title="囚笼"
            description="处置战俘"
            onClick={() => onNavigate(GameState.PRISON)}
          />
          <NavButton 
            icon={<Users className="w-6 h-6" />}
            title="收藏"
            description="查看图鉴"
            onClick={() => onNavigate(GameState.COLLECTION)}
          />
          <NavButton 
            icon={<ShoppingBag className="w-6 h-6 text-yellow-400" />}
            title="商城"
            description="购买道具"
            onClick={() => onNavigate(GameState.SHOP)}
          />
        </div>
      </div>
    </motion.div>
  );
}

function StatBox({ icon, label, value }: { icon: React.ReactNode, label: string, value: number }) {
  return (
    <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-xl p-1.5 sm:p-3">
      <div className="flex items-center gap-1 sm:gap-2 mb-1">
        {icon}
        <span className="text-[8px] sm:text-[10px] font-mono text-white/40 uppercase">{label}</span>
      </div>
      <div className="text-sm sm:text-lg font-mono font-bold">{value}</div>
    </div>
  );
}

function NavButton({ icon, title, description, onClick, disabled, primary }: { 
  icon: React.ReactNode, 
  title: string, 
  description: string, 
  onClick: () => void,
  disabled?: boolean,
  primary?: boolean
}) {
  return (
    <button 
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "w-full p-4 rounded-2xl border flex flex-col items-start text-left transition-all relative overflow-hidden group",
        primary 
          ? "bg-emerald-500 border-emerald-400 text-black hover:bg-emerald-400" 
          : "bg-zinc-900 border-white/10 hover:bg-zinc-800",
        disabled && "opacity-50 cursor-not-allowed grayscale"
      )}
    >
      <div className={cn("mb-1.5 p-1.5 rounded-xl [&>svg]:w-4 [&>svg]:h-4", primary ? "bg-black/10" : "bg-white/5")}>
        {icon}
      </div>
      <h3 className="text-base font-bold mb-0.5 tracking-tight">{title}</h3>
      <p className={cn("text-[11px]", primary ? "text-black/60" : "text-white/40")}>{description}</p>
      
      {primary && !disabled && (
        <motion.div 
          className="absolute inset-0 bg-white/20 pointer-events-none"
          initial={{ x: '-100%' }}
          animate={{ x: '100%' }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        />
      )}
    </button>
  );
}
