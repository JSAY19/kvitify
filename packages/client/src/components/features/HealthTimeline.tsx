import type { HealthImprovement } from '@kvitifai/shared';
import { motion } from 'framer-motion';
import { Check, Clock } from 'lucide-react';

interface Props {
  items: HealthImprovement[];
}

export function HealthTimeline({ items }: Props) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Улучшения здоровья</h3>
      <div className="space-y-2">
        {items.map((item, i) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50"
          >
            <div
              className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                item.achieved
                  ? 'bg-primary-100 dark:bg-primary-900/40 text-primary-600'
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-400'
              }`}
            >
              {item.achieved ? <Check size={16} /> : <Clock size={14} />}
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-medium ${item.achieved ? '' : 'text-slate-400 dark:text-slate-500'}`}>
                {item.title}
              </p>
              <p className="text-xs text-slate-400 truncate">{item.description}</p>
            </div>
            {!item.achieved && (
              <div className="flex-shrink-0 w-12">
                <div className="h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                  <div
                    className="h-full bg-primary-500 rounded-full transition-all"
                    style={{ width: `${item.progress}%` }}
                  />
                </div>
                <p className="text-[10px] text-slate-400 text-right mt-0.5">{item.progress}%</p>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
