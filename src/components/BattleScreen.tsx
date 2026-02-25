import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Stage, Layer, Rect, Text, Image as KonvaImage, Group } from 'react-konva';
import { motion, AnimatePresence } from 'motion/react';
import { Sword, Shield, Zap, Heart, AlertCircle, MessageSquareQuote, FastForward, Play, Pause, SkipForward } from 'lucide-react';
import { Hero, Monster, Stats, MonsterType, Rarity } from '../types';
import { generateMonster } from '../constants';
import { cn } from '../lib/utils';
import useImage from 'use-image';

interface BattleScreenProps {
  hero: Hero;
  difficulty: number;
  subStage: number;
  onBattleEnd: (won: boolean, rewards: { gold: number, gems: number, exp: number }, monster: Monster) => void;
}

interface BattleState {
  heroHp: number;
  monsterHp: number;
  turn: 'HERO' | 'MONSTER';
  logs: string[];
  isFinished: boolean;
  won: boolean;
  commentary: string;
}

export default function BattleScreen({ hero, difficulty, subStage, onBattleEnd }: BattleScreenProps) {
  const [monster] = useState(() => generateMonster(difficulty, subStage));
  const [battleState, setBattleState] = useState<BattleState>({
    heroHp: hero.stats.hp,
    monsterHp: monster.stats.hp,
    turn: hero.stats.spd >= monster.stats.spd ? 'HERO' : 'MONSTER',
    logs: [`难度 ${difficulty} - 第 ${subStage} 关: 野生的 ${monster.name} (Lv.${monster.level}) 出现了！`],
    isFinished: false,
    won: false,
    commentary: '',
  });

  const [isAuto, setIsAuto] = useState(false);
  const [speed, setSpeed] = useState(1); // 1x, 2x, 4x
  const [stageSize, setStageSize] = useState({ width: 800, height: 400 });
  const containerRef = useRef<HTMLDivElement>(null);
  const turnTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setStageSize({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight,
        });
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const finishBattle = useCallback((won: boolean) => {
    if (turnTimeoutRef.current) clearTimeout(turnTimeoutRef.current);
    
    setBattleState(prev => ({
      ...prev,
      isFinished: true,
      won,
      logs: [won ? '胜利！' : '败北...', ...prev.logs],
      commentary: won ? "一场属于英雄的辉煌胜利！" : "黑暗暂时笼罩了大地..."
    }));

    setTimeout(() => {
      onBattleEnd(won, won ? monster.rewards : { gold: 0, gems: 0, exp: 0 }, monster);
    }, 3000 / speed);
  }, [monster, onBattleEnd, speed]);

  const executeMonsterTurn = useCallback(() => {
    if (battleState.isFinished) return;

    const mDamage = Math.max(1, monster.stats.atk - hero.stats.def);
    const newHeroHp = Math.max(0, battleState.heroHp - mDamage);
    
    setBattleState(prev => ({
      ...prev,
      heroHp: newHeroHp,
      logs: [`${monster.name} 对 ${hero.name} 造成了 ${mDamage} 点伤害！`, ...prev.logs],
      turn: 'HERO',
    }));

    if (newHeroHp <= 0) {
      finishBattle(false);
    }
  }, [battleState.heroHp, battleState.isFinished, hero.name, hero.stats.def, monster.name, monster.stats.atk, finishBattle]);

  const handleAttack = useCallback(() => {
    if (battleState.turn !== 'HERO' || battleState.isFinished) return;

    const damage = Math.max(1, hero.stats.atk);
    const newMonsterHp = Math.max(0, battleState.monsterHp - damage);
    
    setBattleState(prev => ({
      ...prev,
      monsterHp: newMonsterHp,
      logs: [`${hero.name} 对 ${monster.name} 造成了 ${damage} 点伤害！`, ...prev.logs],
      turn: 'MONSTER',
    }));

    if (newMonsterHp <= 0) {
      finishBattle(true);
      return;
    }

    turnTimeoutRef.current = setTimeout(executeMonsterTurn, 1000 / speed);
  }, [battleState.turn, battleState.isFinished, battleState.monsterHp, hero.name, hero.stats.atk, monster.name, speed, executeMonsterTurn, finishBattle]);

  const handleSkip = () => {
    // Simulate the rest of the battle instantly
    let hHp = battleState.heroHp;
    let mHp = battleState.monsterHp;
    let turn = battleState.turn;
    const logs = [...battleState.logs];

    while (hHp > 0 && mHp > 0) {
      if (turn === 'HERO') {
        const damage = Math.max(1, hero.stats.atk);
        mHp = Math.max(0, mHp - damage);
        logs.unshift(`${hero.name} 对 ${monster.name} 造成了 ${damage} 点伤害！`);
        turn = 'MONSTER';
      } else {
        const damage = Math.max(1, monster.stats.atk - hero.stats.def);
        hHp = Math.max(0, hHp - damage);
        logs.unshift(`${monster.name} 对 ${hero.name} 造成了 ${damage} 点伤害！`);
        turn = 'HERO';
      }
    }

    const won = mHp <= 0;
    setBattleState(prev => ({
      ...prev,
      heroHp: hHp,
      monsterHp: mHp,
      isFinished: true,
      won,
      logs: [won ? '胜利！' : '败北...', ...logs],
      commentary: won ? "快速解决战斗！" : "在混乱中落败..."
    }));

    setTimeout(() => {
      onBattleEnd(won, won ? monster.rewards : { gold: 0, gems: 0, exp: 0 }, monster);
    }, 1000);
  };

  // Auto-battle logic
  useEffect(() => {
    if (isAuto && battleState.turn === 'HERO' && !battleState.isFinished) {
      const timer = setTimeout(handleAttack, 500 / speed);
      return () => clearTimeout(timer);
    }
  }, [isAuto, battleState.turn, battleState.isFinished, handleAttack, speed]);

  const getRarityColor = (rarity: Rarity) => {
    switch(rarity) {
      case Rarity.C: return '#94a3b8';
      case Rarity.B: return '#10b981';
      case Rarity.A: return '#a855f7';
      case Rarity.S: return '#fbbf24';
      case Rarity.SS: return '#ef4444';
      case Rarity.SSS: return '#ffffff';
      default: return '#ffffff';
    }
  };

  return (
    <div className="h-full flex flex-col p-2 sm:p-4 lg:p-6 gap-2 sm:gap-4 lg:gap-6 overflow-hidden">
      {/* Battle Arena */}
      <div ref={containerRef} className="flex-[2] bg-zinc-900/50 rounded-2xl sm:rounded-3xl border border-white/10 relative overflow-hidden min-h-[250px]">
        <Stage width={stageSize.width} height={stageSize.height}>
          <Layer>
            {/* Hero */}
            <Group x={stageSize.width * 0.2} y={stageSize.height * 0.5 - 50}>
              <Text 
                text={hero.name?.[0] || '?'} 
                width={100} 
                height={100}
                align="center" 
                verticalAlign="middle"
                fill="white" 
                fontSize={50} 
                fontStyle="bold"
                fontFamily="serif"
              />
              <Rect
                width={100}
                height={100}
                stroke={getRarityColor(hero.rarity)}
                strokeWidth={3}
                cornerRadius={15}
              />
              <Text 
                text={hero.name} 
                y={110} 
                width={100} 
                align="center" 
                fill="white" 
                fontSize={12} 
                fontStyle="bold"
              />
            </Group>

            {/* Monster */}
            <Group x={stageSize.width * 0.8 - 100} y={stageSize.height * 0.5 - 50}>
              <Rect
                width={100}
                height={100}
                fill="#18181b"
                stroke={monster.type === MonsterType.BOSS ? '#fbbf24' : (monster.type === MonsterType.ELITE ? '#a855f7' : '#ef4444')}
                strokeWidth={2}
                cornerRadius={15}
              />
              <Text 
                text={monster.name?.[0] || '?'} 
                width={100} 
                height={100}
                align="center" 
                verticalAlign="middle"
                fill="white" 
                fontSize={50} 
                fontStyle="bold"
                fontFamily="serif"
                opacity={0.5}
              />
              <Text 
                text={monster.name} 
                y={110} 
                width={100} 
                align="center" 
                fill="white" 
                fontSize={12} 
                fontStyle="bold"
              />
            </Group>

            {/* VS Text */}
            <Text 
              text="VS" 
              x={stageSize.width * 0.5 - 30} 
              y={stageSize.height * 0.5 - 15} 
              width={60} 
              align="center" 
              fill="white" 
              fontSize={30} 
              fontStyle="bold"
              opacity={0.1}
            />
          </Layer>
        </Stage>

        {/* HP Bars Overlay */}
        <div className="absolute top-4 sm:top-6 left-4 sm:left-6 right-4 sm:right-6 flex justify-between gap-2">
          <HealthBar name={hero.name} current={battleState.heroHp} max={hero.stats.hp} color="bg-emerald-500" />
          <HealthBar name={monster.name} current={battleState.monsterHp} max={monster.stats.hp} color="bg-red-500" align="right" />
        </div>

        {/* Battle Controls Overlay (Top Right) */}
        <div className="absolute top-16 sm:top-20 right-4 sm:right-6 flex flex-col gap-2">
          <button 
            onClick={() => setIsAuto(!isAuto)}
            className={cn(
              "p-2 rounded-lg border transition-all flex items-center gap-2 text-xs font-bold",
              isAuto ? "bg-emerald-500 text-black border-emerald-400" : "bg-black/40 text-white border-white/10"
            )}
          >
            {isAuto ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            自动
          </button>
          <button 
            onClick={() => setSpeed(prev => prev === 1 ? 2 : (prev === 2 ? 4 : 1))}
            className="p-2 rounded-lg border bg-black/40 text-white border-white/10 text-xs font-bold flex items-center gap-2"
          >
            <FastForward className="w-4 h-4" />
            {speed}x
          </button>
          <button 
            onClick={handleSkip}
            className="p-2 rounded-lg border bg-black/40 text-white border-white/10 text-xs font-bold flex items-center gap-2"
          >
            <SkipForward className="w-4 h-4" />
            跳过
          </button>
        </div>

        {/* Battle Result Overlay */}
        <AnimatePresence>
          {battleState.isFinished && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 flex items-center justify-center z-20 bg-black/80 backdrop-blur-sm p-4 sm:p-8"
            >
              <div className="text-center w-full max-w-md">
                <motion.h2 
                  initial={{ scale: 0.5 }}
                  animate={{ scale: 1 }}
                  className={cn(
                    "text-5xl sm:text-6xl font-bold mb-4 tracking-tighter",
                    battleState.won ? "text-emerald-400" : "text-red-400"
                  )}
                >
                  {battleState.won ? "胜利" : "败北"}
                </motion.h2>
                
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-6">
                  <p className="text-sm sm:text-base italic text-white/80">
                    "{battleState.commentary}"
                  </p>
                </div>

                {battleState.won && (
                  <div className="grid grid-cols-3 gap-2">
                    <RewardBox label="金币" value={monster.rewards.gold} color="text-yellow-400" />
                    <RewardBox label="钻石" value={monster.rewards.gems} color="text-cyan-400" />
                    <RewardBox label="经验" value={monster.rewards.exp} color="text-emerald-400" />
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Controls & Logs */}
      <div className="flex-1 flex flex-col sm:flex-row gap-2 sm:gap-4 min-h-[150px]">
        {/* Actions */}
        <div className="w-full sm:w-48 lg:w-64 flex flex-col gap-2">
          <button 
            onClick={handleAttack}
            disabled={battleState.turn !== 'HERO' || battleState.isFinished || isAuto}
            className={cn(
              "flex-1 rounded-xl border flex items-center justify-center gap-2 transition-all group py-3 sm:py-0",
              battleState.turn === 'HERO' && !battleState.isFinished && !isAuto
                ? "bg-emerald-500 border-emerald-400 text-black hover:bg-emerald-400"
                : "bg-zinc-900 border-white/10 opacity-50 cursor-not-allowed"
            )}
          >
            <Sword className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span className="text-base font-bold">攻击</span>
          </button>
          <div className="bg-zinc-900/50 border border-white/10 rounded-xl p-2 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-white/40" />
            <p className="text-[10px] text-white/40 leading-tight">
              {battleState.turn === 'HERO' ? "你的回合！" : "敌人正在攻击..."}
              {isAuto && " (自动战斗中)"}
            </p>
          </div>
        </div>

        {/* Logs */}
        <div className="flex-1 bg-black/40 border border-white/10 rounded-xl p-3 overflow-y-auto font-mono text-[10px] sm:text-xs">
          <div className="flex flex-col gap-1">
            {battleState.logs.map((log, i) => (
              <div key={i} className={cn(
                "py-0.5 border-b border-white/5",
                i === 0 ? "text-white" : "text-white/40"
              )}>
                <span className="text-emerald-500 mr-1">[{battleState.logs.length - i}]</span>
                {log}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function RewardBox({ label, value, color }: { label: string, value: number, color: string }) {
  return (
    <div className="bg-black/40 rounded-lg p-2 border border-white/5">
      <div className="text-[9px] text-white/40 uppercase font-mono mb-0.5">{label}</div>
      <div className={cn("text-sm sm:text-base font-bold", color)}>+{value}</div>
    </div>
  );
}

function HealthBar({ name, current, max, color, align = 'left' }: { 
  name: string, 
  current: number, 
  max: number, 
  color: string,
  align?: 'left' | 'right'
}) {
  const percentage = (current / max) * 100;
  return (
    <div className={cn("flex-1 max-w-[180px]", align === 'right' && "text-right")}>
      <div className="text-[10px] sm:text-xs font-bold mb-1 flex justify-between items-end gap-2">
        {align === 'left' ? (
          <>
            <span className="truncate">{name}</span>
            <span className="text-[9px] font-mono opacity-60 shrink-0">{Math.floor(current)}/{Math.floor(max)}</span>
          </>
        ) : (
          <>
            <span className="text-[9px] font-mono opacity-60 shrink-0">{Math.floor(current)}/{Math.floor(max)}</span>
            <span className="truncate">{name}</span>
          </>
        )}
      </div>
      <div className="h-1.5 sm:h-2 bg-black/40 rounded-full border border-white/10 overflow-hidden">
        <motion.div 
          className={cn("h-full", color)}
          initial={{ width: '100%' }}
          animate={{ width: `${percentage}%` }}
          transition={{ type: 'spring', bounce: 0, duration: 0.5 }}
        />
      </div>
    </div>
  );
}
