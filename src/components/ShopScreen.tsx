import React from 'react';
import { motion } from 'motion/react';
import { ShoppingBag, Coins, Gem, Zap, Clock, BookOpen, ArrowRightLeft } from 'lucide-react';
import { Player, InventoryItem } from '../types';
import { cn } from '../lib/utils';

interface ShopScreenProps {
  player: Player;
  onBuyItem: (type: InventoryItem['type'], price: number, currency: 'gold' | 'gems') => void;
  onExchange: (mode: 'gem_to_gold' | 'gold_to_gem') => void;
}

export default function ShopScreen({ player, onBuyItem, onExchange }: ShopScreenProps) {
  const shopItems = [
    { 
      type: 'POTION_SPEED' as const, 
      name: '快速孕育药剂', 
      price: 50, 
      currency: 'gold' as const, 
      icon: <Zap className="w-6 h-6 text-yellow-400" />, 
      desc: '加速孕育进度 5 分钟' 
    },
    { 
      type: 'POTION_COOLDOWN' as const, 
      name: '消除冷却药剂', 
      price: 500, 
      currency: 'gold' as const, 
      icon: <Clock className="w-6 h-6 text-blue-400" />, 
      desc: '立即重置孕育冷却时间 (1小时)' 
    },
    { 
      type: 'TRAINING_BOOK' as const, 
      name: '子嗣培养书', 
      price: 100, 
      currency: 'gold' as const, 
      icon: <BookOpen className="w-6 h-6 text-emerald-400" />, 
      desc: '用于培养子嗣，提升随机属性评分' 
    },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="h-full p-6 flex flex-col gap-6 overflow-y-auto"
    >
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-emerald-500" /> 皇家商城
          </h2>
          <p className="text-white/40 text-sm">购买道具，加速你的血统繁衍</p>
        </div>
        <div className="flex gap-4">
          <div className="flex items-center gap-2 bg-black/40 px-4 py-2 rounded-2xl border border-white/10">
            <Coins className="w-4 h-4 text-yellow-400" />
            <span className="font-mono font-bold">{player.gold}</span>
          </div>
          <div className="flex items-center gap-2 bg-black/40 px-4 py-2 rounded-2xl border border-white/10">
            <Gem className="w-4 h-4 text-emerald-400" />
            <span className="font-mono font-bold">{player.gems}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {shopItems.map(item => (
          <div key={item.type} className="bg-zinc-900/50 border border-white/10 rounded-3xl p-6 flex flex-col items-center text-center group hover:bg-zinc-800 transition-all">
            <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              {item.icon}
            </div>
            <h3 className="text-lg font-bold mb-1">{item.name}</h3>
            <p className="text-white/40 text-xs mb-6 h-8">{item.desc}</p>
            
            <button
              onClick={() => onBuyItem(item.type, item.price, item.currency)}
              disabled={player[item.currency] < item.price}
              className="w-full py-3 rounded-xl bg-emerald-500 text-black font-bold hover:bg-emerald-400 transition-all disabled:opacity-50 disabled:grayscale"
            >
              <div className="flex items-center justify-center gap-2">
                {item.currency === 'gold' ? <Coins className="w-4 h-4" /> : <Gem className="w-4 h-4" />}
                {item.price} 购买
              </div>
            </button>
          </div>
        ))}
      </div>

      <div className="bg-zinc-900/50 border border-white/10 rounded-3xl p-8">
        <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
          <ArrowRightLeft className="w-5 h-5 text-emerald-500" /> 货币兑换
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-black/20 p-6 rounded-2xl border border-white/5 flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Gem className="w-5 h-5 text-emerald-400" />
                <span className="font-bold">1 钻石</span>
              </div>
              <span className="text-white/20">→</span>
              <div className="flex items-center gap-2">
                <Coins className="w-5 h-5 text-yellow-400" />
                <span className="font-bold">100 金币</span>
              </div>
            </div>
            <button
              onClick={() => onExchange('gem_to_gold')}
              disabled={player.gems < 1}
              className="w-full py-3 rounded-xl border border-white/10 hover:bg-white/5 font-bold transition-all disabled:opacity-50"
            >
              立即兑换
            </button>
          </div>

          <div className="bg-black/20 p-6 rounded-2xl border border-white/5 flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Coins className="w-5 h-5 text-yellow-400" />
                <span className="font-bold">150 金币</span>
              </div>
              <span className="text-white/20">→</span>
              <div className="flex items-center gap-2">
                <Gem className="w-5 h-5 text-emerald-400" />
                <span className="font-bold">1 钻石</span>
              </div>
            </div>
            <button
              onClick={() => onExchange('gold_to_gem')}
              disabled={player.gold < 150}
              className="w-full py-3 rounded-xl border border-white/10 hover:bg-white/5 font-bold transition-all disabled:opacity-50"
            >
              立即兑换
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
