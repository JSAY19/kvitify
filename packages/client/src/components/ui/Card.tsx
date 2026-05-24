import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  glass?: boolean;
  onClick?: () => void;
}

export function Card({ children, className = '', glass, onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={`
        rounded-2xl p-6 shadow-sm
        ${glass
          ? 'glass-card'
          : 'bg-white dark:bg-zinc-900/70 backdrop-blur-xl border border-slate-200 dark:border-white/5'}
        ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
}
