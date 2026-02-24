import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Skull, Heart, Zap, Flame, Trash2, Users } from 'lucide-react';
import { Player, Prisoner, Gender, HeroClass, Rarity, Hero, Stats, Race } from '../types';
import { cn } from '../lib/utils';

import HeroAvatar from './HeroAvatar';

interface PrisonScreenProps {
  player: Player;
  onPersuade: (prisoner: Prisoner) => void;
  onExecute: (id: string) => void;
  onTorture: (id: string, type: 'wax' | 'whip' | 'toy') => void;
}

const RARITY_COLORS = {
  [Rarity.C]: 'text-slate-400',
  [Rarity.B]: 'text-emerald-400',
  [Rarity.A]: 'text-purple-400',
  [Rarity.S]: 'text-yellow-400',
  [Rarity.SS]: 'text-red-500',
  [Rarity.SSS]: 'text-white shadow-[0_0_10px_rgba(255,255,255,0.3)]',
};

const RARITY_LABELS = {
  [Rarity.C]: 'C级',
  [Rarity.B]: 'B级',
  [Rarity.A]: 'A级',
  [Rarity.S]: 'S级',
  [Rarity.SS]: 'SS级',
  [Rarity.SSS]: 'SSS级',
};

export default function PrisonScreen({ player, onPersuade, onExecute, onTorture }: PrisonScreenProps) {
  const [selectedId, setSelectedId] = useState<string | null>(player.prisoners?.[0]?.id || null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const selected = player.prisoners?.find(p => p.id === selectedId);

  const handleAction = (id: string, type: 'wax' | 'whip' | 'toy') => {
    const reactions = {
      wax: [
        "滚烫的蜡油滴在皮肤上，囚犯发出痛苦的呻吟，意志开始动摇。",
        "灼热的痛楚让囚犯浑身颤抖，眼神中充满了恐惧。",
        "每一滴蜡油都像是烙印，囚犯的自尊在高温下逐渐融化。"
      ],
      whip: [
        "皮鞭划破空气的声音伴随着惨叫，囚犯的背部留下了触目惊心的红痕。",
        "严酷的鞭刑让囚犯几乎昏厥，身体的痛苦远超意志的负荷。",
        "在不断的抽打下，囚犯终于低下了高傲的头颅。"
      ],
      toy: [
        "极尽羞辱的玩弄让囚犯感到无地自容，精神防线彻底崩溃。",
        "这种玩弄比肉体的痛苦更让他难以忍受，羞耻感吞噬了他的理智。",
        "在你的嘲弄与玩弄下，囚犯的眼神变得空洞而绝望。"
      ]
    };
    
    const randomReaction = reactions[type][Math.floor(Math.random() * reactions[type].length)];
    setFeedback(randomReaction);
    onTorture(id, type);
    setTimeout(() => setFeedback(null), 3000);
  };

  const handlePersuadeClick = () => {
    if (!selected) return;
    setFeedback("你展现了仁慈与力量，囚犯被你的魅力所折服，决定效忠于你。");
    setTimeout(() => {
      onPersuade(selected);
      setFeedback(null);
    }, 2000);
  };

  return (
    <div className="h-full flex flex-col p-2 lg:p-3 gap-2 lg:gap-3 overflow-y-auto">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg lg:text-xl font-bold tracking-tight">囚笼</h2>
          <p className="text-white/40 text-[9px] lg:text-[10px]">关押战败者的阴暗之地</p>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-4 lg:gap-6 overflow-hidden">
        {/* Prisoner List */}
        <div className="w-full lg:w-48 bg-zinc-900/50 rounded-2xl border border-white/10 overflow-y-auto p-2 flex flex-row lg:flex-col gap-1.5 min-h-[90px] lg:min-h-0">
          {player.prisoners?.map(p => (
            <button
              key={p.id}
              onClick={() => setSelectedId(p.id)}
              className={cn(
                "p-3 lg:p-4 rounded-2xl border transition-all text-left min-w-[140px] lg:min-w-0",
                selectedId === p.id 
                  ? "bg-red-500/20 border-red-500/50" 
                  : "bg-white/5 border-white/10 hover:bg-white/10"
              )}
            >
              <div className="font-bold truncate text-sm lg:text-base">{p.name}</div>
              <div className="text-[10px] opacity-50">{p.rarity} | {p.class}</div>
            </button>
          ))}
          {(!player.prisoners || player.prisoners.length === 0) && (
            <div className="h-full w-full flex flex-col items-center justify-center text-white/20 text-center p-4">
              <Users className="w-8 h-8 lg:w-12 lg:h-12 mb-2 lg:mb-4" />
              <p className="text-xs lg:text-sm">目前没有囚犯。</p>
            </div>
          )}
        </div>

        {/* Action Area */}
        <div className="flex-1 bg-zinc-900/50 rounded-2xl border border-white/10 p-3 lg:p-4 flex flex-col relative overflow-y-auto">
          <AnimatePresence>
            {feedback && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="absolute top-4 left-4 right-4 z-50 bg-red-500 text-white p-3 rounded-xl text-center text-sm font-bold shadow-2xl border border-red-400"
              >
                {feedback}
              </motion.div>
            )}
          </AnimatePresence>

          {selected ? (
            <div className="flex flex-col h-full">
              <div className="flex flex-col sm:flex-row gap-4 lg:gap-8 mb-6 lg:mb-8">
                <div className="flex justify-center">
                  <HeroAvatar name={selected.name} rarity={selected.rarity} size="lg" />
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <h3 className="text-lg lg:text-xl font-bold mb-1">{selected.name}</h3>
                  <div className="flex flex-wrap justify-center sm:justify-start gap-2 lg:gap-3 text-[9px] lg:text-[10px] text-white/60 mb-2">
                    <span>性别: {selected.gender}</span>
                    <span>职业: {selected.class}</span>
                    <span>种族: {selected.race}</span>
                    <span className={cn("font-bold", RARITY_COLORS[selected.rarity])}>
                      稀有度: {RARITY_LABELS[selected.rarity]}
                    </span>
                  </div>
                  
                  <div className="flex flex-col gap-2 mb-4">
                    <div className="text-[10px] text-white/40 font-mono uppercase">血统纯度</div>
                    <div className="flex flex-wrap justify-center sm:justify-start gap-2">
                      {selected.bloodlines?.map((b, i) => (
                        <div key={i} className="px-2 py-1 bg-white/5 rounded-lg border border-white/10 text-[10px]">
                          <span className="text-white/60">{b.race}:</span>
                          <span className="ml-1 font-bold text-emerald-400">{b.purity}%</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="w-full bg-white/5 h-4 rounded-full overflow-hidden border border-white/10 relative">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${selected.will}%` }}
                      className="h-full bg-red-500"
                    />
                    <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold">
                      意志力: {selected.will}/100
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4 mt-auto">
                <ActionButton 
                  icon={<Heart className="w-5 h-5" />}
                  label="感化"
                  desc="尝试说服其加入你的阵营"
                  onClick={handlePersuadeClick}
                  disabled={selected.will > 0}
                  color="emerald"
                />
                <ActionButton 
                  icon={<Flame className="w-5 h-5" />}
                  label="滴蜡"
                  desc="通过灼热的痛苦摧毁意志"
                  onClick={() => handleAction(selected.id, 'wax')}
                  color="orange"
                />
                <ActionButton 
                  icon={<Zap className="w-5 h-5" />}
                  label="鞭打"
                  desc="严酷的刑罚"
                  onClick={() => handleAction(selected.id, 'whip')}
                  color="red"
                />
                <ActionButton 
                  icon={<Skull className="w-5 h-5" />}
                  label="玩弄"
                  desc="极尽羞辱之能事"
                  onClick={() => handleAction(selected.id, 'toy')}
                  color="purple"
                />
                <ActionButton 
                  icon={<Trash2 className="w-5 h-5" />}
                  label="处决"
                  desc="终结这个卑微的生命"
                  onClick={() => onExecute(selected.id)}
                  color="zinc"
                  className="sm:col-span-2"
                />
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-white/20">
              <Skull className="w-16 h-16 lg:w-24 lg:h-24 mb-4 lg:mb-6" />
              <p className="text-lg lg:text-xl">请选择一名囚犯进行处置</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ActionButton({ icon, label, desc, onClick, disabled, color, className }: any) {
  const colors: any = {
    emerald: "hover:bg-emerald-500/20 border-emerald-500/30 text-emerald-400",
    orange: "hover:bg-orange-500/20 border-orange-500/30 text-orange-400",
    red: "hover:bg-red-500/20 border-red-500/30 text-red-400",
    purple: "hover:bg-purple-500/20 border-purple-500/30 text-purple-400",
    zinc: "hover:bg-zinc-500/20 border-zinc-500/30 text-zinc-400",
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex items-center gap-3 lg:gap-4 p-3 lg:p-4 rounded-2xl border transition-all text-left group",
        colors[color],
        disabled && "opacity-30 cursor-not-allowed grayscale",
        className
      )}
    >
      <div className="p-2 lg:p-3 rounded-xl bg-white/5 group-hover:bg-white/10 transition-colors">
        {icon}
      </div>
      <div>
        <div className="font-bold text-sm lg:text-base">{label}</div>
        <div className="text-[9px] lg:text-[10px] opacity-60 line-clamp-1">{desc}</div>
      </div>
    </button>
  );
}
