import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

const TOTAL_SECONDS = 5 * 60;
const RADIUS = 90;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const MESSAGES = [
  'Тяга к курению пройдёт через...',
  'Ты справишься! Дыши глубоко.',
  'Каждая секунда — победа!',
  'Выпей воды. Отвлекись.',
  'Вспомни, ради чего ты бросаешь.',
];

export function CravingTimer({ onClose }: { onClose: () => void }) {
  const [remaining, setRemaining] = useState(TOTAL_SECONDS);
  const [running, setRunning] = useState(true);

  useEffect(() => {
    if (!running || remaining <= 0) return;
    const timer = setInterval(() => setRemaining((r) => r - 1), 1000);
    return () => clearInterval(timer);
  }, [running, remaining]);

  const progress = (TOTAL_SECONDS - remaining) / TOTAL_SECONDS;
  const dashOffset = CIRCUMFERENCE * (1 - progress);

  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;

  const messageIdx = Math.min(MESSAGES.length - 1, Math.floor(progress * MESSAGES.length));

  const handleDone = useCallback(() => {
    setRunning(false);
    onClose();
  }, [onClose]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="flex flex-col items-center gap-6 py-4"
      >
        <button
          onClick={handleDone}
          className="self-end p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          aria-label="Закрыть"
        >
          <X size={20} className="text-slate-400" />
        </button>

        <div className="relative w-52 h-52 flex items-center justify-center">
          <svg className="absolute inset-0 -rotate-90" viewBox="0 0 200 200">
            <circle
              cx="100" cy="100" r={RADIUS}
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              className="text-slate-200 dark:text-slate-700"
            />
            <motion.circle
              cx="100" cy="100" r={RADIUS}
              fill="none"
              stroke="url(#grad)"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              animate={{ strokeDashoffset: dashOffset }}
              transition={{ duration: 1, ease: 'linear' }}
            />
            <defs>
              <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#22c55e" />
                <stop offset="100%" stopColor="#06b6d4" />
              </linearGradient>
            </defs>
          </svg>

          <div className="text-center z-10">
            {remaining > 0 ? (
              <>
                <p className="text-4xl font-mono font-bold">
                  {minutes}:{seconds.toString().padStart(2, '0')}
                </p>
              </>
            ) : (
              <motion.p
                initial={{ scale: 0.5 }}
                animate={{ scale: 1 }}
                className="text-2xl font-bold text-primary-500"
              >
                Отлично!
              </motion.p>
            )}
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.p
            key={messageIdx}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="text-center text-sm text-slate-500 dark:text-slate-400 max-w-xs"
          >
            {remaining > 0 ? MESSAGES[messageIdx] : 'Тяга к курению отступила. Вы сильнее, чем думаете!'}
          </motion.p>
        </AnimatePresence>

        {remaining <= 0 && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={handleDone}
            className="px-6 py-3 rounded-xl bg-primary-500 text-white font-semibold hover:bg-primary-600 transition-colors"
          >
            Готово
          </motion.button>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
