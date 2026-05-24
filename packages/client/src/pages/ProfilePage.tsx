import { useAuthStore } from '../stores/authStore';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { User, Mail, Calendar, Target, LogOut, Bell, Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatDate, formatMoney } from '../lib/format';
import { usePushNotifications } from '../hooks/usePushNotifications';
import { api } from '../services/api';
import toast from 'react-hot-toast';

export function ProfilePage() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();
  const { isSupported, isSubscribed, subscribe } = usePushNotifications();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Профиль</h2>

      <Card>
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center">
              <User size={24} className="text-primary-600" />
            </div>
            <div>
              <p className="font-semibold">{user.name}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <Mail size={12} />
                {user.email}
              </p>
            </div>
          </div>
        </div>
      </Card>

      {user.profile && (
        <Card>
          <h3 className="font-semibold mb-3">Параметры курения</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Calendar size={14} />
                Дата отказа
              </span>
              <span className="font-medium">{formatDate(user.profile.quitDate)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Сигарет в день</span>
              <span className="font-medium">{user.profile.cigarettesPerDay}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Цена пачки</span>
              <span className="font-medium">{formatMoney(user.profile.pricePerPack)}</span>
            </div>
            {user.profile.smokingYears != null && (
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Лет курения</span>
                <span className="font-medium">{user.profile.smokingYears}</span>
              </div>
            )}
            {user.profile.motivation && (
              <div className="pt-2 border-t border-slate-100 dark:border-slate-700">
                <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 mb-1">
                  <Target size={14} />
                  Мотивация
                </div>
                <p className="text-sm">{user.profile.motivation}</p>
              </div>
            )}
          </div>
        </Card>
      )}

      {isSupported && !isSubscribed && (
        <Card>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell size={20} className="text-primary-500" />
              <div>
                <p className="text-sm font-medium">Уведомления</p>
                <p className="text-xs text-slate-400">Получайте напоминания и мотивацию</p>
              </div>
            </div>
            <Button size="sm" onClick={subscribe}>Включить</Button>
          </div>
        </Card>
      )}

      {isSubscribed && (
        <Card>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell size={20} className="text-primary-500" />
              <p className="text-sm text-slate-500 dark:text-slate-400">Уведомления включены</p>
            </div>
            <Button
              size="sm"
              variant="secondary"
              onClick={async () => {
                try {
                  await api.post('/push/test')
                  toast.success('Уведомление отправлено!')
                } catch {
                  toast.error('Не удалось отправить уведомление')
                }
              }}
            >
              <Send size={14} />
              Тест
            </Button>
          </div>
        </Card>
      )}

      <Button variant="danger" className="w-full" onClick={handleLogout}>
        <LogOut size={16} />
        Выйти
      </Button>

      <p className="text-xs text-center text-slate-400">
        КвитиФай v1.0.0 — Это не медицинское приложение. Проконсультируйтесь с врачом.
      </p>
    </div>
  );
}
