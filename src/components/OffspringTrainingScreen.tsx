import React from 'react';
import { motion } from 'motion/react';
import { GraduationCap, Heart, Sword, Shield, Zap, Sparkles, BookOpen, CheckCircle2 } from 'lucide-react';
import { Player, Offspring, Stats } from '../types';
import { cn } from '../lib/utils';
import HeroAvatar from './HeroAvatar';

interface OffspringTrainingScreenProps {
  player: Player;
  offspring: Offspring;
  onTrain: (id: string, stat: keyof Stats) => void;
  onFinish: (id: string) => void;
  onBack: () => void;
}

export default function OffspringTrainingScreen({ player, offspring, onTrain, onFinish, onBack }: OffspringTrainingScreenProps) {
  const trainingBook = player.inventory.find(i => i.type === 'TRAINING_BOOK');
  const bookCount = trainingBook?.count || 0;

  const stats: { key: keyof Stats, label: string, icon: React.ReactNode, color: string }[] = [
    { key: 'maxHp', label: '生命', icon: <Heart className="w-4 h-4" />, color: 'text-red-400' },
    { key: 'atk', label: '攻击', icon: <Sword className="w-4 h-4" />, color: 'text-orange-400' },
    { key: 'def', label: '防御', icon: <Shield className="w-4 h-4" />, color: 'text-blue-400' },
    { key: 'spd', label: '速度', icon: <Zap className="w-4 h-4" />, color: 'text-yellow-400' },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="h-full p-6 flex flex-col gap-6 overflow-y-auto"
    >
      <div className="flex justify-between items-center">
        <button onClick={onBack} className="text-white/40 hover:text-white transition-colors">← 返回收藏馆</button>
        <div className="flex items-center gap-2 bg-black/40 px-4 py-2 rounded-2xl border border-white/10">
          <BookOpen className="w-4 h-4 text-emerald-400" />
          <span className="text-xs text-white/60">培养书:</span>
          <span className="font-mono font-bold">{bookCount}</span>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
        <div className="w-full md:w-1/3 flex flex-col items-center text-center">
          <div className="relative mb-6">
            <HeroAvatar name={offspring.name} rarity={offspring.rarity} size="lg" />
            <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-black p-2 rounded-full shadow-lg">
              <GraduationCap className="w-5 h-5" />
            </div>
          </div>
          <h2 className="text-2xl font-bold mb-1">{offspring.name}</h2>
          <div className="px-3 py-1 bg-white/5 rounded-full border border-white/10 text-xs text-white/60 mb-4">
            {offspring.race} | {offspring.rarity}级子嗣
          </div>
          <div className="w-full bg-zinc-900/50 border border-white/10 rounded-2xl p-4">
            <div className="text-[10px] text-white/40 font-mono uppercase mb-2">血统组成</div>
            <div className="flex flex-wrap justify-center gap-2">
              {offspring.bloodlines.map((b, i) => (
                <div key={i} className="px-2 py-1 bg-white/5 rounded-lg border border-white/10 text-[10px]">
                  <span className="text-white/60">{b.race}:</span>
                  <span className="ml-1 font-bold text-emerald-400">{b.purity}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex-1 w-full">
          <div className="bg-zinc-900/50 border border-white/10 rounded-3xl p-6 mb-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold">属性培养</h3>
              <div className="text-xs text-white/40">培养次数: <span className="text-emerald-400 font-bold">{offspring.trainingCount}/10</span></div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              {stats.map(s => (
                <div key={s.key} className="bg-black/20 p-4 rounded-2xl border border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn("p-2 rounded-xl bg-white/5", s.color)}>{s.icon}</div>
                    <div>
                      <div className="text-xs text-white/40">{s.label}</div>
                      <div className="text-lg font-mono font-bold">{offspring.stats[s.key]}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => onTrain(offspring.id, s.key)}
                    disabled={bookCount <= 0 || offspring.trainingCount >= 10}
                    className="p-3 rounded-xl bg-emerald-500 text-black hover:bg-emerald-400 transition-all disabled:opacity-20 disabled:grayscale"
                  >
                    <Sparkles className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center px-2">
                <span className="text-sm text-white/60">当前综合评分</span>
                <span className="text-2xl font-mono font-bold text-emerald-400">{offspring.rating}</span>
              </div>
              <button
                onClick={() => onFinish(offspring.id)}
                className="w-full py-4 rounded-2xl bg-white text-black font-bold hover:bg-emerald-500 transition-all flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-5 h-5" /> 完成培养并成年
              </button>
              <p className="text-[10px] text-white/20 text-center">成年后子嗣将可以出战，且无法再次进行培养。</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
