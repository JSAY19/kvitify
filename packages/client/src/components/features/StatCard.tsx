import { type ReactNode } from 'react';

interface StatCardProps {
  icon: ReactNode;
  label: string;
  value: string;
  sub?: string;
  color?: string;
}

export function StatCard({ icon, label, value, sub, color = 'text-primary-500' }: StatCardProps) {
  return (
    <div className="glass-card flex flex-col gap-2">
      <div className={color}>{icon}</div>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
      {sub && <p className="text-[10px] text-slate-400">{sub}</p>}
    </div>
  );
}
