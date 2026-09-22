'use client';

import { motion } from 'framer-motion';
import { CheckCircle2, Clock, Zap, Target, Dumbbell, BookOpen, Wind, Activity } from 'lucide-react';
import { cn } from './cn';
import { Badge } from './Badge';
import { Button } from './Button';

export interface Quest {
  id: string;
  title: string;
  xpReward: number;
  durationMinutes: number;
  category: string;
  isCompleted: boolean;
  description?: string;
}

interface QuestCardProps {
  quest: Quest;
  onComplete?: (id: string) => void;
  delay?: number;
  className?: string;
}

// Category → icon mapping (clean monochrome lucide icons)
const CategoryIcon = ({ category }: { category: string }) => {
  const label = category.toLowerCase();
  if (label.includes('mind') || label.includes('focus'))
    return <Target size={16} className="text-text" aria-hidden />;
  if (label.includes('body') || label.includes('fitness'))
    return <Dumbbell size={16} className="text-text" aria-hidden />;
  if (label.includes('read') || label.includes('learn'))
    return <BookOpen size={16} className="text-text" aria-hidden />;
  if (label.includes('meditat') || label.includes('breath'))
    return <Wind size={16} className="text-text" aria-hidden />;
  return <Zap size={16} className="text-text" aria-hidden />;
};

export function QuestCard({ quest, onComplete, delay = 0, className }: QuestCardProps) {
  const { id, title, xpReward, durationMinutes, category, isCompleted, description } = quest;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.16, 1, 0.3, 1] }}
      whileHover={isCompleted ? {} : { y: -2, transition: { duration: 0.2 } }}
      className={cn(
        'relative rounded-xl p-4 flex flex-col gap-3',
        'border transition-colors duration-200',
        isCompleted
          ? 'bg-white/2 border-white/6 opacity-60'
          : 'bg-[#111111] border-white/10 hover:border-white/18 hover:bg-[#141414]',
        className,
      )}
    >
      {/* Completed overlay checkmark */}
      {isCompleted && (
        <div className="absolute top-3 right-3">
          <CheckCircle2 size={16} className="text-[#555555]" aria-hidden />
        </div>
      )}

      {/* Header row */}
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-white/5 border border-white/8 flex items-center justify-center">
          <CategoryIcon category={category} />
        </div>
        <div className="flex-1 min-w-0">
          <h3
            className={cn(
              'font-display text-[14px] font-semibold leading-snug',
              isCompleted ? 'text-[#555555] line-through' : 'text-[#F5F5F5]',
            )}
          >
            {title}
          </h3>
          {description && (
            <p className="font-sans text-[11px] text-[#555555] mt-0.5 leading-snug truncate">
              {description}
            </p>
          )}
        </div>
      </div>

      {/* Meta row */}
      <div className="flex items-center gap-2 flex-wrap">
        <Badge variant="muted" size="sm">
          {category}
        </Badge>
        <span className="inline-flex items-center gap-1 text-[10px] font-sans text-[#555555]">
          <Clock size={10} aria-hidden />
          {durationMinutes}m
        </span>
        <span className="inline-flex items-center gap-1 text-[10px] font-sans text-[#A0A0A0] ml-auto">
          <Zap size={10} aria-hidden />
          <span className="font-numbers">{xpReward}</span>&nbsp;XP
        </span>
      </div>

      {/* Action */}
      {!isCompleted && onComplete && (
        <Button
          variant="ghost"
          size="sm"
          className="self-start text-[#A0A0A0] hover:text-[#F5F5F5] px-0 h-auto py-0"
          onClick={() => onComplete(id)}
          aria-label={`Mark "${title}" as done`}
        >
          <CheckCircle2 size={13} className="mr-1" aria-hidden />
          Mark Done
        </Button>
      )}
    </motion.div>
  );
}
