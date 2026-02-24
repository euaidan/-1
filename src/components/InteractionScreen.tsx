import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Player, Hero, Gender, Rarity, InventoryItem } from '../types';
import { INTERACTION_ITEMS } from '../constants';
import { cn } from '../lib/utils';
import { Heart, Gift, MessageCircle, Edit3, Coins, UserCircle2, Baby, Zap, Clock } from 'lucide-react';

interface InteractionScreenProps {
  player: Player;
  activeHero: Hero;
  onUpdateAffection: (id: string, amount: number) => void;
  onUpdateStats: (updates: Partial<Player>) => void;
  onRenameHero: (id: string, name: string) => void;
  onUpdateGender: (id: string, gender: Gender) => void;
  onStartBreeding: (id: string) => void;
  onSpeedUpBreeding: (id: string, type: InventoryItem['type']) => void;
  onClaimOffspring: (id: string) => void;
}

export default function InteractionScreen({ 
  player, 
  activeHero, 
  onUpdateAffection, 
  onUpdateStats,
  onRenameHero,
  onUpdateGender,
  onStartBreeding,
  onSpeedUpBreeding,
  onClaimOffspring
}: InteractionScreenProps) {
  const [chatMessage, setChatMessage] = useState<string | null>(null);
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState(activeHero.name);
  const [, setTick] = useState(0);

  // Force re-render every second for timers
  React.useEffect(() => {
    const timer = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const isBreeding = activeHero.isBreeding;
  const breedingEndTime = activeHero.breedingEndTime || 0;
  const breedingCooldownEnd = activeHero.breedingCooldownEnd || 0;
  const now = Date.now();
  const isFinished = isBreeding && now >= breedingEndTime;
  const isOnCooldown = !isBreeding && now < breedingCooldownEnd;

  const formatTime = (ms: number) => {
    const s = Math.max(0, Math.floor(ms / 1000));
    const m = Math.floor(s / 60);
    const rs = s % 60;
    return `${m}:${rs.toString().padStart(2, '0')}`;
  };

  const handleChat = () => {
    const messages = [
      "今天的天气真不错，适合去冒险。",
      "谢谢你一直以来的照顾。",
      "我感觉到我的力量正在慢慢增强。",
      "你觉得我这身装扮怎么样？",
      "无论发生什么，我都会守护在你身边。",
    ];
    setChatMessage(messages[Math.floor(Math.random() * messages.length)]);
    onUpdateAffection(activeHero.id, 2);
    setTimeout(() => setChatMessage(null), 3000);
  };

  const handleGiveGift = (item: typeof INTERACTION_ITEMS[0]) => {
    if (player.gold < item.price) return;
    
    onUpdateStats({ gold: player.gold - item.price });
    onUpdateAffection(activeHero.id, item.affection);
    setChatMessage(`收到了${item.name}！好感度提升了！`);
    setTimeout(() => setChatMessage(null), 3000);
  };

  return (
    <div className="h-full flex flex-col md:flex-row p-4 gap-4 overflow-hidden">
      {/* Hero Visual */}
      <div className="flex-1 relative rounded-3xl overflow-hidden border border-white/10 bg-zinc-900/50 flex items-center justify-center">
        <span className="text-9xl font-bold opacity-10">{activeHero.name[0]}</span>
        
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
        
        <div className="absolute bottom-8 left-8 right-8">
          <AnimatePresence>
            {chatMessage && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="bg-white text-black p-3 rounded-2xl mb-3 relative shadow-xl"
              >
                <div className="absolute -bottom-2 left-8 w-4 h-4 bg-white rotate-45" />
                <p className="font-medium">{chatMessage}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex items-end justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Heart className="w-4 h-4 text-red-500 fill-red-500" />
                <span className="text-lg font-bold">好感度: {activeHero.affection}</span>
              </div>
              <h2 className="text-2xl font-bold">{activeHero.name}</h2>
              <p className="text-white/60 text-xs">{activeHero.class} | {activeHero.gender}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Interaction Controls */}
      <div className="w-full md:w-80 flex flex-col gap-3 overflow-y-auto pr-2">
        {/* Basic Actions */}
        <div className="grid grid-cols-2 gap-3">
          <ActionButton 
            icon={<MessageCircle className="w-5 h-5" />} 
            label="聊天" 
            onClick={handleChat} 
          />
          <ActionButton 
            icon={<Edit3 className="w-5 h-5" />} 
            label="改名" 
            onClick={() => setIsRenaming(true)} 
          />
        </div>

        {/* Breeding System */}
        <div className="bg-zinc-900/50 border border-white/10 rounded-2xl p-4">
          <h3 className="text-sm font-bold text-white/40 uppercase mb-3 flex items-center gap-2">
            <Baby className="w-4 h-4" /> 孕育子嗣
          </h3>
          
          {isBreeding ? (
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-white/60">{isFinished ? '孕育完成' : '孕育中...'}</span>
                <span className="font-mono font-bold text-emerald-400">
                  {isFinished ? '0:00' : formatTime(breedingEndTime - now)}
                </span>
              </div>
              <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden border border-white/10">
                <motion.div 
                  className="h-full bg-emerald-500"
                  initial={false}
                  animate={{ width: `${Math.min(100, (1 - (breedingEndTime - now) / (5 * 60 * 1000)) * 100)}%` }}
                />
              </div>
              
              {isFinished ? (
                <button
                  onClick={() => onClaimOffspring(activeHero.id)}
                  className="w-full py-3 rounded-xl bg-emerald-500 text-black font-bold hover:bg-emerald-400 transition-all"
                >
                  迎接子嗣
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={() => onSpeedUpBreeding(activeHero.id, 'POTION_SPEED')}
                    disabled={!player.inventory.find(i => i.type === 'POTION_SPEED')}
                    className="flex-1 py-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-[10px] font-bold disabled:opacity-50"
                  >
                    <Zap className="w-3 h-3 inline mr-1" /> 加速5m
                  </button>
                </div>
              )}
            </div>
          ) : isOnCooldown ? (
            <div className="text-center py-4">
              <Clock className="w-8 h-8 text-white/20 mx-auto mb-2" />
              <div className="text-xs text-white/40 mb-2">冷却中</div>
              <div className="text-xl font-mono font-bold text-white/60">{formatTime(breedingCooldownEnd - now)}</div>
              <button
                onClick={() => onSpeedUpBreeding(activeHero.id, 'POTION_COOLDOWN')}
                disabled={!player.inventory.find(i => i.type === 'POTION_COOLDOWN')}
                className="mt-3 w-full py-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-[10px] font-bold disabled:opacity-50"
              >
                <Zap className="w-3 h-3 inline mr-1" /> 消除冷却 (1h)
              </button>
            </div>
          ) : (
            <button
              onClick={() => onStartBreeding(activeHero.id)}
              disabled={activeHero.affection < 100}
              className="w-full py-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all group"
            >
              <div className="text-lg font-bold mb-1 group-hover:text-emerald-400 transition-colors">开始孕育</div>
              <div className="text-[10px] text-white/40">需要好感度 100 (当前: {activeHero.affection})</div>
            </button>
          )}
        </div>

        {/* Gender Select */}
        <div className="bg-zinc-900/50 border border-white/10 rounded-2xl p-4">
          <h3 className="text-sm font-bold text-white/40 uppercase mb-3 flex items-center gap-2">
            <UserCircle2 className="w-4 h-4" /> 自定义性别
          </h3>
          <div className="flex gap-2">
            {[Gender.MALE, Gender.FEMALE, Gender.NON_BINARY].map(g => (
              <button
                key={g}
                onClick={() => onUpdateGender(activeHero.id, g)}
                className={cn(
                  "flex-1 py-2 rounded-xl border text-sm font-bold transition-all",
                  activeHero.gender === g 
                    ? "bg-emerald-500 border-emerald-400 text-black" 
                    : "bg-white/5 border-white/10 hover:bg-white/10"
                )}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        {/* Gift Shop */}
        <div className="bg-zinc-900/50 border border-white/10 rounded-2xl p-4 flex-1">
          <h3 className="text-sm font-bold text-white/40 uppercase mb-4 flex items-center gap-2">
            <Gift className="w-4 h-4" /> 赠送礼物
          </h3>
          <div className="flex flex-col gap-3">
            {INTERACTION_ITEMS.map(item => (
              <button
                key={item.id}
                onClick={() => handleGiveGift(item)}
                disabled={player.gold < item.price}
                className="flex items-center justify-between p-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all disabled:opacity-50"
              >
                <div className="text-left">
                  <div className="font-bold">{item.name}</div>
                  <div className="text-[10px] text-white/40">{item.description}</div>
                </div>
                <div className="flex items-center gap-1.5 font-mono text-yellow-400">
                  <Coins className="w-3 h-3" />
                  {item.price}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Rename Modal */}
      <AnimatePresence>
        {isRenaming && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-zinc-900 border border-white/10 p-8 rounded-3xl w-full max-w-sm"
            >
              <h3 className="text-2xl font-bold mb-6">修改英雄名字</h3>
              <input 
                autoFocus
                value={newName}
                onChange={e => setNewName(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 mb-6 outline-none focus:border-emerald-500"
              />
              <div className="flex gap-3">
                <button 
                  onClick={() => setIsRenaming(false)}
                  className="flex-1 py-3 rounded-xl border border-white/10 font-bold hover:bg-white/5"
                >
                  取消
                </button>
                <button 
                  onClick={() => {
                    onRenameHero(activeHero.id, newName);
                    setIsRenaming(false);
                  }}
                  className="flex-1 py-3 rounded-xl bg-emerald-500 text-black font-bold hover:bg-emerald-400"
                >
                  确定
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ActionButton({ icon, label, onClick }: { icon: React.ReactNode, label: string, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className="flex flex-col items-center gap-2 p-4 rounded-2xl border border-white/10 bg-zinc-900/50 hover:bg-zinc-800 transition-all"
    >
      <div className="p-2 rounded-xl bg-white/5">{icon}</div>
      <span className="text-sm font-bold">{label}</span>
    </button>
  );
}
