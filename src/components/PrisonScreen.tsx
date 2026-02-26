import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Skull, Heart, Zap, Flame, Trash2, Users, Lock, Unlock, Baby, AlertTriangle } from 'lucide-react';
import { Player, Prisoner, Gender, HeroClass, Rarity, Hero, Stats, Race, BodyPart, MentalState } from '../types';
import { PUNISHMENT_TEXTS } from '../constants';
import { cn } from '../lib/utils';

import HeroAvatar from './HeroAvatar';

interface PrisonScreenProps {
  player: Player;
  onPersuade: (prisoner: Prisoner) => void;
  onExecute: (id: string) => void;
  onTorture: (id: string, type: 'wax' | 'whip' | 'toy') => void;
  onSexualPunishment: (id: string, part: BodyPart) => void;
  onToggleLock: (id: string, type: 'hero' | 'offspring' | 'prisoner') => void;
  onBulkExecute: (rarities: Rarity[]) => void;
  onSpeedUpPregnancy: (id: string) => void;
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

export default function PrisonScreen({ 
  player, 
  onPersuade, 
  onExecute, 
  onTorture,
  onSexualPunishment,
  onToggleLock,
  onBulkExecute,
  onSpeedUpPregnancy
}: PrisonScreenProps) {
  const [selectedId, setSelectedId] = useState<string | null>(player.prisoners?.[0]?.id || null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [showBodyPartSelect, setShowBodyPartSelect] = useState(false);
  const [showBulkExecute, setShowBulkExecute] = useState(false);
  const [showSpeedUpModal, setShowSpeedUpModal] = useState(false);
  const [bulkRarities, setBulkRarities] = useState<Rarity[]>([Rarity.C, Rarity.B, Rarity.A]);

  const selected = player.prisoners?.find(p => p.id === selectedId);

  const handleAction = (id: string, type: 'wax' | 'whip' | 'toy') => {
    const reactions = {
      wax: [
        "滚烫的蜡油滴在皮肤上，囚犯发出痛苦的呻吟，意志开始动摇。",
        "灼热的痛楚让囚犯浑身颤暴力地抖，眼神中充满了恐惧。",
        "每一滴蜡油都像是烙印，囚犯的自尊在高温下逐渐融化。",
        "你将蜡油滴在囚犯最敏感的部位，看着他因为剧痛而扭曲的面孔，心中充满了快感。",
        "滚烫的液体顺着皮肤流淌，囚犯的呼吸变得急促，眼神中流露出绝望。"
      ],
      whip: [
        "皮鞭划破空气的声音伴随着惨叫，囚犯的背部留下了触目惊心的红痕。",
        "严酷的鞭刑让囚犯几乎昏厥，身体的痛苦远超意志的负荷。",
        "在不断的抽打下，囚犯终于低下了高傲的头颅。",
        "每一鞭都带起一片血花，囚犯的求饶声在空旷的囚室中回荡。",
        "你无情地挥动长鞭，直到囚犯的身体不再颤抖，只剩下微弱的喘息。"
      ],
      toy: [
        "极尽羞辱的玩弄让囚犯感到无地自容，精神防线彻底崩溃。",
        "这种玩弄比肉体的痛苦更让他难以忍受，羞耻感吞噬了他的理智。",
        "在你的嘲弄与玩弄下，囚犯的眼神变得空洞而绝望。",
        "你用各种器具羞辱着他的尊严，看着他从愤怒到绝望，最后只剩下空洞的顺从。",
        "这种精神上的折磨让他彻底丧失了反抗的意志，成为了你手中的玩物。"
      ]
    };
    
    const randomReaction = reactions[type][Math.floor(Math.random() * reactions[type].length)];
    setFeedback(randomReaction);
    onTorture(id, type);
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleSexualPunishmentClick = (part: BodyPart) => {
    if (!selected) return;
    const texts = PUNISHMENT_TEXTS[part];
    const randomText = texts[Math.floor(Math.random() * texts.length)];
    setFeedback(randomText);
    onSexualPunishment(selected.id, part);
    setShowBodyPartSelect(false);
    setTimeout(() => setFeedback(null), 4000);
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
        <button 
          onClick={() => setShowBulkExecute(true)}
          className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-500 border border-red-500/30 rounded-xl text-xs font-bold transition-all flex items-center gap-2"
        >
          <Trash2 className="w-4 h-4" />
          一键处决
        </button>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-4 lg:gap-6 overflow-hidden">
        {/* Prisoner List */}
        <div className="w-full lg:w-48 bg-zinc-900/50 rounded-2xl border border-white/10 overflow-y-auto p-2 flex flex-row lg:flex-col gap-1.5 min-h-[90px] lg:min-h-0">
          {player.prisoners?.map(p => (
            <div
              key={p.id}
              onClick={() => setSelectedId(p.id)}
              className={cn(
                "p-3 lg:p-4 rounded-2xl border transition-all text-left min-w-[140px] lg:min-w-0 relative cursor-pointer",
                selectedId === p.id 
                  ? "bg-red-500/20 border-red-500/50" 
                  : "bg-white/5 border-white/10 hover:bg-white/10"
              )}
            >
              <div className="font-bold truncate text-sm lg:text-base">{p.name}</div>
              <div className="text-[10px] opacity-50">{p.rarity} | {p.class}</div>
              {p.isLocked && <Lock className="absolute top-2 right-2 w-3 h-3 text-red-400" />}
              {p.isPregnant && (
                <button 
                  onClick={(e) => { e.stopPropagation(); setSelectedId(p.id); setShowSpeedUpModal(true); }}
                  className="absolute bottom-2 right-2 p-1 bg-pink-500/20 hover:bg-pink-500/40 rounded-full transition-all"
                >
                  <Baby className="w-3 h-3 text-pink-400 animate-pulse" />
                </button>
              )}
            </div>
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
                <div className="flex justify-center relative">
                  <HeroAvatar name={selected.name} rarity={selected.rarity} size="lg" />
                  <button 
                    onClick={() => onToggleLock(selected.id, 'prisoner')}
                    className={cn(
                      "absolute -top-2 -right-2 p-2 rounded-full border transition-all shadow-lg",
                      selected.isLocked ? "bg-red-500 border-red-400 text-white" : "bg-zinc-800 border-white/10 text-white/40"
                    )}
                  >
                    {selected.isLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                  </button>
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <div className="flex items-center justify-center sm:justify-start gap-3 mb-1">
                    <h3 className="text-lg lg:text-xl font-bold">{selected.name}</h3>
                    {selected.mentalState === MentalState.BREAKDOWN && (
                      <span className="px-2 py-0.5 bg-red-500/20 text-red-500 border border-red-500/30 rounded text-[10px] font-bold flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> 精神崩溃
                      </span>
                    )}
                  </div>
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
                  icon={<Baby className="w-5 h-5" />}
                  label="性爱惩罚"
                  desc="选择身体部位进行惩罚"
                  onClick={() => setShowBodyPartSelect(true)}
                  color="pink"
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
                  desc={`处决可获得 ${selected.rarity === Rarity.SSS ? 500 : selected.rarity === Rarity.SS ? 200 : selected.rarity === Rarity.S ? 100 : 50} 钻石`}
                  onClick={() => onExecute(selected.id)}
                  color="zinc"
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

      {/* Body Part Selection Modal */}
      <AnimatePresence>
        {showBodyPartSelect && selected && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-zinc-900 border border-white/10 rounded-3xl p-6 max-w-md w-full"
            >
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Baby className="w-6 h-6 text-pink-500" />
                选择惩罚部位
              </h3>
              <div className="grid grid-cols-2 gap-3 mb-6">
                {Object.values(BodyPart).map(part => {
                  const isFemaleOnly = part === BodyPart.VAGINA || part === BodyPart.CLITORIS;
                  const isMaleOnly = part === BodyPart.PENIS;
                  
                  let canSelect = true;
                  if (isFemaleOnly) {
                    canSelect = selected.gender === Gender.FEMALE || selected.gender === Gender.NON_BINARY;
                  } else if (isMaleOnly) {
                    canSelect = selected.gender === Gender.MALE || selected.gender === Gender.NON_BINARY;
                  }
                  
                  return (
                    <button
                      key={part}
                      disabled={!canSelect}
                      onClick={() => handleSexualPunishmentClick(part)}
                      className={cn(
                        "p-3 rounded-xl border text-sm font-bold transition-all",
                        canSelect ? "bg-white/5 border-white/10 hover:bg-pink-500/20 hover:border-pink-500/50" : "opacity-20 cursor-not-allowed"
                      )}
                    >
                      {part}
                    </button>
                  );
                })}
              </div>
              <button 
                onClick={() => setShowBodyPartSelect(false)}
                className="w-full py-3 rounded-xl bg-white/5 border border-white/10 text-sm font-bold hover:bg-white/10"
              >
                取消
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pregnancy Speed Up Modal */}
      <AnimatePresence>
        {showSpeedUpModal && selected && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-zinc-900 border border-white/10 rounded-3xl p-6 max-w-sm w-full"
            >
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Zap className="w-6 h-6 text-pink-500" />
                加速孕育
              </h3>
              <p className="text-sm text-white/60 mb-6">
                使用 50 钻石加速孕育过程，立即产下子嗣？
              </p>
              
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowSpeedUpModal(false)}
                  className="flex-1 py-3 rounded-xl bg-white/5 border border-white/10 text-sm font-bold hover:bg-white/10"
                >
                  取消
                </button>
                <button 
                  onClick={() => {
                    if (player.gems >= 50) {
                      onSpeedUpPregnancy(selected.id);
                      setShowSpeedUpModal(false);
                      setFeedback("孕育加速成功！");
                      setTimeout(() => setFeedback(null), 2000);
                    } else {
                      setFeedback("钻石不足！");
                      setTimeout(() => setFeedback(null), 2000);
                    }
                  }}
                  className="flex-1 py-3 rounded-xl bg-pink-500 text-white text-sm font-bold hover:bg-pink-400"
                >
                  确认 (50💎)
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bulk Execute Modal */}
      <AnimatePresence>
        {showBulkExecute && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-zinc-900 border border-white/10 rounded-3xl p-6 max-w-sm w-full"
            >
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Trash2 className="w-6 h-6 text-red-500" />
                一键处决
              </h3>
              <p className="text-sm text-white/60 mb-6">
                选择要处决的品级。锁定中的角色不会被处决。
              </p>
              
              <div className="flex flex-wrap gap-2 mb-8">
                {[Rarity.C, Rarity.B, Rarity.A].map(r => (
                  <button 
                    key={r}
                    onClick={() => setBulkRarities(prev => prev.includes(r) ? prev.filter(x => x !== r) : [...prev, r])}
                    className={cn(
                      "px-4 py-2 rounded-xl border text-sm font-bold transition-all",
                      bulkRarities.includes(r) ? "bg-red-500 border-red-400 text-white" : "bg-white/5 border-white/10 text-white/40"
                    )}
                  >
                    {RARITY_LABELS[r]}
                  </button>
                ))}
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => setShowBulkExecute(false)}
                  className="flex-1 py-3 rounded-xl bg-white/5 border border-white/10 text-sm font-bold hover:bg-white/10"
                >
                  取消
                </button>
                <button 
                  onClick={() => {
                    onBulkExecute(bulkRarities);
                    setShowBulkExecute(false);
                  }}
                  className="flex-1 py-3 rounded-xl bg-red-500 text-white text-sm font-bold hover:bg-red-400"
                >
                  确认处决
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
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
    pink: "hover:bg-pink-500/20 border-pink-500/30 text-pink-400",
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
