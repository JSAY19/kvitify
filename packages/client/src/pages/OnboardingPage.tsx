import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { Calendar, Cigarette, Heart } from 'lucide-react';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { useAuthStore } from '../stores/authStore';

const getSubmitErrorMessage = (err: unknown): string => {
  if (!axios.isAxiosError(err)) return 'Ошибка сохранения. Попробуйте ещё раз.'
  const data = err.response?.data as { error?: string; details?: { path?: string; message: string }[] }
  if (data?.details?.length) {
    return data.details.map((d) => d.message).join('. ')
  }
  if (typeof data?.error === 'string' && data.error) return data.error
  if (err.response?.status === 401) return 'Сессия истекла. Войдите снова.'
  if (err.response?.status === 409) return data?.error ?? 'Профиль уже создан. Перейдите на главную или войдите заново.'
  if (!err.response) return 'Нет связи с сервером. Проверьте, что API запущен (npm run dev).'
  return 'Ошибка сохранения. Попробуйте ещё раз.'
}

const STEPS = [
  { icon: Calendar, title: 'Когда бросаете?', subtitle: 'Выберите дату, с которой начнётся ваша новая жизнь' },
  { icon: Cigarette, title: 'Ваши привычки', subtitle: 'Расскажите о своём курении' },
  { icon: Heart, title: 'Мотивация', subtitle: 'Что побуждает вас бросить?' },
];

export function OnboardingPage() {
  const navigate = useNavigate();
  const onboarding = useAuthStore((s) => s.onboarding);

  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [quitDate, setQuitDate] = useState(new Date().toISOString().slice(0, 10));
  const [cigarettesPerDay, setCigarettesPerDay] = useState('20');
  const [pricePerPack, setPricePerPack] = useState('200');
  const [cigarettesPerPack, setCigarettesPerPack] = useState('20');
  const [smokingYears, setSmokingYears] = useState('');
  const [motivation, setMotivation] = useState('');

  const handleNext = () => setStep((s) => Math.min(s + 1, 2));
  const handleBack = () => setStep((s) => Math.max(s - 1, 0));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    const cpd = parseInt(cigarettesPerDay, 10);
    const ppp = parseFloat(pricePerPack);
    const cpp = parseInt(cigarettesPerPack, 10);
    if (Number.isNaN(cpd) || cpd < 1) {
      setError('Укажите корректное число сигарет в день.');
      return;
    }
    if (Number.isNaN(ppp) || ppp < 0) {
      setError('Укажите корректную цену пачки.');
      return;
    }
    if (Number.isNaN(cpp) || cpp < 1) {
      setError('Укажите корректное число сигарет в пачке.');
      return;
    }
    const qd = new Date(quitDate);
    if (Number.isNaN(qd.getTime())) {
      setError('Укажите корректную дату отказа.');
      return;
    }
    let smokingYearsNum: number | undefined;
    if (smokingYears.trim() !== '') {
      smokingYearsNum = parseInt(smokingYears, 10);
      if (Number.isNaN(smokingYearsNum) || smokingYearsNum < 0) {
        setError('Укажите корректное число лет курения или оставьте поле пустым.');
        return;
      }
    }
    setLoading(true);
    try {
      await onboarding({
        quitDate: qd.toISOString(),
        cigarettesPerDay: cpd,
        pricePerPack: ppp,
        cigarettesPerPack: cpp,
        smokingYears: smokingYearsNum,
        motivation: motivation.trim() || undefined,
      });
      navigate('/');
    } catch (err) {
      setError(getSubmitErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const StepIcon = STEPS[step]!.icon;

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-6">
        {/* Progress dots */}
        <div className="flex justify-center gap-2">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-2 rounded-full transition-all ${
                i === step ? 'w-8 bg-primary-500' : i < step ? 'w-2 bg-primary-300' : 'w-2 bg-slate-300 dark:bg-slate-600'
              }`}
            />
          ))}
        </div>

        <div className="text-center">
          <div className="inline-flex p-3 rounded-2xl bg-primary-100 dark:bg-primary-900/30 mb-3">
            <StepIcon size={28} className="text-primary-600 dark:text-primary-400" />
          </div>
          <h2 className="text-xl font-bold">{STEPS[step]!.title}</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{STEPS[step]!.subtitle}</p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              {step === 0 && (
                <Input
                  label="Дата отказа"
                  type="date"
                  value={quitDate}
                  onChange={(e) => setQuitDate(e.target.value)}
                  required
                />
              )}

              {step === 1 && (
                <>
                  <Input
                    label="Сигарет в день"
                    type="number"
                    min="1"
                    max="100"
                    value={cigarettesPerDay}
                    onChange={(e) => setCigarettesPerDay(e.target.value)}
                    required
                  />
                  <Input
                    label="Цена пачки (руб)"
                    type="number"
                    min="0"
                    step="10"
                    value={pricePerPack}
                    onChange={(e) => setPricePerPack(e.target.value)}
                    required
                  />
                  <Input
                    label="Сигарет в пачке"
                    type="number"
                    min="1"
                    max="50"
                    value={cigarettesPerPack}
                    onChange={(e) => setCigarettesPerPack(e.target.value)}
                    required
                  />
                  <Input
                    label="Лет курения (необязательно)"
                    type="number"
                    min="0"
                    value={smokingYears}
                    onChange={(e) => setSmokingYears(e.target.value)}
                  />
                </>
              )}

              {step === 2 && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Ваша мотивация (необязательно)
                  </label>
                  <textarea
                    value={motivation}
                    onChange={(e) => setMotivation(e.target.value)}
                    maxLength={500}
                    rows={4}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                    placeholder="Здоровье, семья, деньги..."
                  />
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          <div className="flex gap-3 mt-6">
            {step > 0 && (
              <Button type="button" variant="secondary" onClick={handleBack} className="flex-1">
                Назад
              </Button>
            )}
            {step < 2 ? (
              <Button type="button" onClick={handleNext} className="flex-1">
                Далее
              </Button>
            ) : (
              <Button type="submit" loading={loading} className="flex-1">
                Начать путь
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
