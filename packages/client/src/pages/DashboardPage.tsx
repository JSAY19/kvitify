import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Calendar, Wallet, Cigarette, Flame, Zap, ClipboardCheck,
  Lightbulb, Trophy, ArrowRight, Wind,
} from 'lucide-react';
import { useProgressStore } from '../stores/progressStore';
import { useAuthStore } from '../stores/authStore';
import { StatCard } from '../components/features/StatCard';
import { DailyHealthCard } from '../components/features/DailyHealthCard';
import { CheckinModal } from '../components/features/CheckinModal';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { pluralizeDays, formatMoney } from '../lib/format';
import { api } from '../services/api';
import toast from 'react-hot-toast';

interface TipData {
  tip: string;
  dayNumber: number;
}

interface NextAchievement {
  title: string;
  description: string;
  progress: number;
}

function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-700 ${className}`} />;
}

function getNextAchievement(days: number, money: number): NextAchievement | null {
  const milestones = [
    { days: 1, title: 'Первый день', description: '1 день без сигарет' },
    { days: 3, title: 'Три дня силы', description: '3 дня без сигарет' },
    { days: 7, title: 'Неделя свободы', description: '7 дней без сигарет' },
    { days: 14, title: 'Две недели', description: '14 дней без сигарет' },
    { days: 30, title: 'Месяц!', description: '30 дней без сигарет' },
    { days: 90, title: 'Квартал', description: '90 дней без сигарет' },
    { days: 180, title: 'Полгода', description: '180 дней без сигарет' },
    { days: 365, title: 'Год свободы!', description: '365 дней без сигарет' },
  ];

  const next = milestones.find((m) => m.days > days);
  if (!next) return null;

  const prev = milestones[milestones.indexOf(next) - 1];
  const startDays = prev ? prev.days : 0;
  const progress = Math.round(((days - startDays) / (next.days - startDays)) * 100);

  return { title: next.title, description: next.description, progress: Math.min(99, progress) };
}

export function DashboardPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const { dashboard, isLoading, fetchDashboard } = useProgressStore();
  const [checkinOpen, setCheckinOpen] = useState(false);
  const [tip, setTip] = useState<TipData | null>(null);

  useEffect(() => {
    fetchDashboard();
    api.get('/tips/daily').then((r) => setTip(r.data)).catch(() => {});
  }, [fetchDashboard]);

  const handleCraving = () => navigate('/craving');

  const handleCheckinDone = () => {
    setCheckinOpen(false);
    fetchDashboard();
    toast.success('Отметка сохранена!');
  };

  if (isLoading || !dashboard) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-2/3" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24" />)}
        </div>
        <Skeleton className="h-32" />
        <Skeleton className="h-48" />
      </div>
    );
  }

  const nextAch = getNextAchievement(dashboard.daysWithoutSmoking, dashboard.moneySaved);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold">Привет, {user?.name}!</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {dashboard.daysWithoutSmoking > 0
            ? `Ты не куришь уже ${pluralizeDays(dashboard.daysWithoutSmoking)}!`
            : 'Сегодня первый день твоей новой жизни!'}
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={<Calendar size={20} />} label="Без сигарет" value={pluralizeDays(dashboard.daysWithoutSmoking)} />
        <StatCard icon={<Wallet size={20} />} label="Сэкономлено" value={formatMoney(dashboard.moneySaved)} color="text-accent-500" />
        <StatCard icon={<Cigarette size={20} />} label="Не выкурено" value={`${dashboard.cigarettesAvoided}`} sub="сигарет" color="text-orange-500" />
        <StatCard icon={<Flame size={20} />} label="Серия" value={pluralizeDays(dashboard.streak)} color="text-red-500" />
      </div>

      <div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <Button variant="danger" size="lg" className="w-full text-base" onClick={handleCraving}>
                    <Zap size={20} /> Хочу курить
                  </Button>

                <div className="flex flex-col gap-2">
                  <div className="flex gap-3">
                    <Button variant="secondary" className="flex-1" onClick={() => setCheckinOpen(true)}>
                      <ClipboardCheck size={18} /> Отметка дня
                    </Button>
                    <Button
                      variant="ghost"
                      className="flex-1 border border-slate-200 dark:border-white/10"
                      onClick={() => navigate('/breathing')}
                      title="Упражнения на дыхание — снижают стресс при тяге"
                      aria-label="Открыть дыхательные практики"
                    >
                      <Wind size={18} aria-hidden /> Дыхание
                    </Button>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 px-0.5">
                    Дыхание — короткое упражнение по таймеру, когда сильно тянет закурить или просто нужно успокоиться.
                  </p>
                </div>

                {tip && (
                  <Card className="border-l-4 border-l-amber-400 dark:border-l-amber-500 bg-gradient-to-r from-amber-50 to-transparent dark:from-amber-900/10 dark:to-transparent">
                    <div className="flex gap-3">
                      <Lightbulb size={20} className="text-amber-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 mb-1">Совет дня</p>
                        <p className="text-sm text-slate-700 dark:text-slate-300">{tip.tip}</p>
                      </div>
                    </div>
                  </Card>
                )}

                {nextAch && (
                  <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/achievements')}>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center shrink-0">
                        <Trophy size={20} className="text-primary-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-semibold truncate">{nextAch.title}</p>
                          <ArrowRight size={16} className="text-slate-400 shrink-0" />
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{nextAch.description}</p>
                        <div className="mt-2 h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${nextAch.progress}%` }}
                            transition={{ duration: 1, ease: 'easeOut' }}
                            className="h-full rounded-full bg-gradient-to-r from-primary-500 to-accent-500"
                          />
                        </div>
                      </div>
                    </div>
                  </Card>
                )}
              </div>

              <DailyHealthCard />
            </div>
          </div>

      <CheckinModal open={checkinOpen} onClose={handleCheckinDone} />
    </div>
  );
}
