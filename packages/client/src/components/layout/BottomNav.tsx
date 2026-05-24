import { NavLink, useNavigate } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, MessageCircle, BookOpen, BarChart3,
  MoreHorizontal, User, Trophy, Users, Wind,
} from 'lucide-react';

const mainLinks = [
  { to: '/', icon: LayoutDashboard, label: 'Главная' },
  { to: '/chat', icon: MessageCircle, label: 'Чат' },
  { to: '/journal', icon: BookOpen, label: 'Дневник' },
  { to: '/progress', icon: BarChart3, label: 'Прогресс' },
];

const moreLinks = [
  { to: '/profile', icon: User, label: 'Профиль' },
  { to: '/achievements', icon: Trophy, label: 'Достижения' },
  { to: '/community', icon: Users, label: 'Сообщество' },
  { to: '/breathing', icon: Wind, label: 'Дыхание' },
];

export function BottomNav() {
  const [showMore, setShowMore] = useState(false);
  const navigate = useNavigate();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMore(false);
      }
    }
    if (showMore) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMore]);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/80 dark:bg-zinc-950/70 backdrop-blur-xl border-t border-slate-200 dark:border-white/5 safe-bottom">
      <div className="flex items-center justify-around h-16 max-w-6xl mx-auto relative">
        {mainLinks.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-colors ${
                isActive
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`
            }
          >
            <Icon size={22} />
            <span className="text-[10px] font-medium">{label}</span>
          </NavLink>
        ))}

        <div ref={menuRef} className="relative">
          <button
            onClick={() => setShowMore((v) => !v)}
            className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-colors ${
              showMore ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            <MoreHorizontal size={22} />
            <span className="text-[10px] font-medium">Ещё</span>
          </button>

          <AnimatePresence>
            {showMore && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute bottom-full right-0 mb-2 bg-white dark:bg-zinc-900/95 backdrop-blur-xl rounded-2xl shadow-xl border border-slate-200 dark:border-white/10 py-2 min-w-[180px]"
              >
                {moreLinks.map(({ to, icon: Icon, label }) => (
                  <button
                    key={to}
                    onClick={() => { navigate(to); setShowMore(false); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                  >
                    <Icon size={18} className="text-slate-500" />
                    {label}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </nav>
  );
}
