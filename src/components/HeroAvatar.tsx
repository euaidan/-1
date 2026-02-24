import React from 'react';
import { cn } from '../lib/utils';
import { Rarity } from '../types';

interface HeroAvatarProps {
  name: string;
  rarity: Rarity;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const RARITY_COLORS = {
  [Rarity.C]: 'from-slate-500/20 to-slate-500/40 border-slate-500/50 text-slate-300',
  [Rarity.B]: 'from-emerald-500/20 to-emerald-500/40 border-emerald-500/50 text-emerald-300',
  [Rarity.A]: 'from-purple-500/20 to-purple-500/40 border-purple-500/50 text-purple-300',
  [Rarity.S]: 'from-yellow-500/20 to-yellow-500/40 border-yellow-500/50 text-yellow-300',
  [Rarity.SS]: 'from-red-500/20 to-red-500/40 border-red-500/50 text-red-300',
  [Rarity.SSS]: 'from-indigo-500/20 to-purple-500/40 border-white/50 text-white shadow-[0_0_15px_rgba(255,255,255,0.3)]',
};

const SIZES = {
  sm: 'w-8 h-8 text-base',
  md: 'w-14 h-14 text-xl',
  lg: 'w-24 h-24 text-4xl',
  xl: 'w-40 h-40 text-6xl',
};

export default function HeroAvatar({ name, rarity, className, size = 'md' }: HeroAvatarProps) {
  const initial = name ? name[0] : '?';
  
  return (
    <div className={cn(
      "rounded-2xl border bg-gradient-to-br flex items-center justify-center font-bold font-display shadow-inner",
      RARITY_COLORS[rarity],
      SIZES[size],
      className
    )}>
      {initial}
    </div>
  );
}
