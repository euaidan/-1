import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, Skull } from 'lucide-react';
import { Pet } from '../types';
import { cn } from '../lib/utils';

interface PetWidgetProps {
  pet: Pet;
}

export default function PetWidget({ pet }: PetWidgetProps) {
  const [hearts, setHearts] = useState<{ id: number; x: number }[]>([]);
  const [isBiting, setIsBiting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handlePet = (e: React.MouseEvent) => {
    if (isBiting) return;
    
    const id = Date.now();
    setHearts(prev => [...prev, { id, x: Math.random() * 40 - 20 }]);
    setTimeout(() => {
      setHearts(prev => prev.filter(h => h.id !== id));
    }, 1000);
    
    setMessage(pet.reaction);
    setTimeout(() => setMessage(null), 2000);
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsBiting(true);
    setMessage("哎哟！它咬了你一口！");
    
    setTimeout(() => {
      setIsBiting(false);
      setMessage(null);
    }, 1000);
  };

  return (
    <div className="relative flex flex-col items-center">
      <div 
        className="relative cursor-pointer group"
        onMouseEnter={handlePet}
        onClick={handleClick}
      >
        {/* Hearts Animation */}
        <AnimatePresence>
          {hearts.map(heart => (
            <motion.div
              key={heart.id}
              initial={{ opacity: 0, y: 0, x: heart.x }}
              animate={{ opacity: 1, y: -100, x: heart.x + (Math.random() * 20 - 10) }}
              exit={{ opacity: 0 }}
              className="absolute top-0 pointer-events-none"
            >
              <Heart className="w-6 h-6 text-red-500 fill-red-500" />
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Pet Icon */}
        <motion.div
          animate={isBiting ? { 
            x: [0, -10, 10, -10, 10, 0],
            scale: [1, 1.2, 1],
            rotate: [0, -5, 5, -5, 5, 0]
          } : {
            y: [0, -5, 0]
          }}
          transition={isBiting ? { duration: 0.2 } : { duration: 2, repeat: Infinity }}
          className={cn(
            "w-24 h-24 rounded-full border-4 flex items-center justify-center text-5xl shadow-lg transition-colors",
            isBiting ? "border-red-500 bg-red-500/20" : "border-emerald-500/50 bg-emerald-500/10"
          )}
        >
          <span className={cn(isBiting && "sepia brightness-50")}>
            {pet.icon}
          </span>
          {isBiting && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Skull className="w-12 h-12 text-red-500 animate-pulse" />
            </div>
          )}
        </motion.div>

        {/* Name Tag */}
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-md border border-white/10 px-3 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap">
          {pet.name} ({pet.type})
        </div>
      </div>

      {/* Message Bubble */}
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={cn(
              "absolute -top-12 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap shadow-xl border",
              isBiting ? "bg-red-500 border-red-400 text-white" : "bg-white border-zinc-200 text-black"
            )}
          >
            {message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
