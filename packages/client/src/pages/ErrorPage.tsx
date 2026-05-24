import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Home, RefreshCw, Sparkles, type LucideIcon } from 'lucide-react'

export type ErrorStatus = 400 | 401 | 403 | 404 | 408 | 410 | 418 | 429 | 500 | 502 | 503

interface ErrorPagePreset {
  emoji: string
  title: string
  message: string
  hint?: string
  accent: 'emerald' | 'rose' | 'amber' | 'violet' | 'sky'
}

const PRESETS: Record<ErrorStatus, ErrorPagePreset> = {
  400: { emoji: '🤔', title: 'Что-то не сходится', message: 'Запрос непонятен. Проверь данные и попробуй ещё раз.', accent: 'amber' },
  401: { emoji: '🔒', title: 'Нужно войти', message: 'Чтобы продолжить, авторизуйся в КвитиФай.', hint: 'Сессия могла истечь — заходи заново.', accent: 'sky' },
  403: { emoji: '🚧', title: 'Доступ закрыт', message: 'Эта страница не для тебя — или ещё не для тебя.', hint: 'Если думаешь, что это ошибка — напиши Квити.', accent: 'rose' },
  404: { emoji: '🍃', title: 'Эту страницу мы тоже бросили', message: 'Как и сигареты — её больше нет. И это к лучшему.', hint: 'Но твой путь продолжается. Возвращайся в кабинет.', accent: 'emerald' },
  408: { emoji: '⏳', title: 'Долго думаем', message: 'Сервер не успел ответить. Сделай вдох — и попробуй снова.', accent: 'amber' },
  410: { emoji: '🌫', title: 'Страницы больше нет', message: 'Этот раздел убран. Возможно, мы сделали лучше.', accent: 'violet' },
  418: { emoji: '☕', title: 'Я — чайник', message: 'И кофе тебе сегодня не нужен — попробуй стакан воды.', accent: 'amber' },
  429: { emoji: '🛑', title: 'Слишком много попыток', message: 'Подожди немного и повтори запрос — нам нужна передышка.', hint: 'Это защита, чтобы аккаунт оставался в безопасности.', accent: 'rose' },
  500: { emoji: '💥', title: 'Что-то сломалось у нас', message: 'Мы уже знаем и чиним. Попробуй обновить через минуту.', accent: 'rose' },
  502: { emoji: '🛰', title: 'Сервер на паузе', message: 'Сейчас подключение нестабильно. Подожди и обнови страницу.', accent: 'violet' },
  503: { emoji: '🌙', title: 'Сервис недоступен', message: 'Мы временно в офлайне. Скоро вернёмся.', accent: 'sky' },
}

const ACCENTS = {
  emerald: { ring: 'ring-emerald-400/40', glow: 'from-emerald-400/40 to-teal-500/20', text: 'text-emerald-300', btn: 'bg-emerald-500 hover:bg-emerald-400 text-white shadow-emerald-500/40' },
  rose: { ring: 'ring-rose-400/40', glow: 'from-rose-400/40 to-pink-500/20', text: 'text-rose-300', btn: 'bg-rose-500 hover:bg-rose-400 text-white shadow-rose-500/40' },
  amber: { ring: 'ring-amber-400/40', glow: 'from-amber-400/40 to-orange-500/20', text: 'text-amber-300', btn: 'bg-amber-500 hover:bg-amber-400 text-white shadow-amber-500/40' },
  violet: { ring: 'ring-violet-400/40', glow: 'from-violet-400/40 to-fuchsia-500/20', text: 'text-violet-300', btn: 'bg-violet-500 hover:bg-violet-400 text-white shadow-violet-500/40' },
  sky: { ring: 'ring-sky-400/40', glow: 'from-sky-400/40 to-cyan-500/20', text: 'text-sky-300', btn: 'bg-sky-500 hover:bg-sky-400 text-white shadow-sky-500/40' },
}

interface Props {
  status?: ErrorStatus
  title?: string
  message?: string
  hint?: string
  primaryAction?: { label: string; onClick?: () => void; to?: string; icon?: LucideIcon }
  showHome?: boolean
  showReload?: boolean
}

export function ErrorPage({
  status = 404,
  title,
  message,
  hint,
  primaryAction,
  showHome = true,
  showReload = false,
}: Props) {
  const navigate = useNavigate()
  const preset = PRESETS[status] ?? PRESETS[404]
  const a = ACCENTS[preset.accent]

  const handleBack = () => {
    if (window.history.length > 1) navigate(-1)
    else navigate('/')
  }

  return (
    <div className="relative min-h-screen min-h-[100dvh] overflow-hidden flex items-center justify-center px-4 py-10 bg-slate-50 dark:bg-zinc-950 text-slate-800 dark:text-slate-100">
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className={`absolute -top-40 -left-32 w-[28rem] h-[28rem] rounded-full bg-gradient-to-br ${a.glow} blur-3xl animate-blob`} />
        <div className={`absolute -bottom-32 -right-20 w-[28rem] h-[28rem] rounded-full bg-gradient-to-br ${a.glow} blur-3xl animate-blob`} style={{ animationDelay: '3s' }} />
        <div className="absolute inset-0 auth-grid-bg opacity-40 dark:opacity-20" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative w-full max-w-lg"
      >
        <div className={`relative rounded-3xl p-8 sm:p-10 bg-white/70 dark:bg-white/[0.03] backdrop-blur-2xl ring-1 ${a.ring} shadow-2xl`}>
          <div className="flex flex-col items-center text-center gap-5">
            <motion.div
              initial={{ scale: 0.7, rotate: -8, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 14, delay: 0.1 }}
              className="relative"
            >
              <div className={`absolute inset-0 -m-3 rounded-full bg-gradient-to-br ${a.glow} blur-xl opacity-80 animate-pulse`} aria-hidden />
              <img
                src="/icons/logo.png"
                alt="КвитиФай"
                className="relative w-24 h-24 sm:w-28 sm:h-28 object-contain drop-shadow-[0_8px_20px_rgba(16,185,129,0.55)]"
                draggable={false}
              />
              <motion.span
                aria-hidden
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.35, type: 'spring' }}
                className="absolute -top-2 -right-2 text-3xl select-none"
              >
                {preset.emoji}
              </motion.span>
            </motion.div>

            <div className="flex items-center gap-2">
              <Sparkles className={`w-4 h-4 ${a.text}`} />
              <span className={`text-xs uppercase tracking-[0.25em] font-semibold ${a.text}`}>Код {status}</span>
            </div>

            <motion.h1
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent"
            >
              {title ?? preset.title}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-md"
            >
              {message ?? preset.message}
            </motion.p>

            {(hint ?? preset.hint) && (
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md">{hint ?? preset.hint}</p>
            )}

            <div className="mt-2 flex flex-wrap items-center justify-center gap-2 w-full">
              {primaryAction ? (
                primaryAction.to ? (
                  <Link
                    to={primaryAction.to}
                    className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold shadow-lg transition-all active:scale-[0.97] ${a.btn}`}
                  >
                    {primaryAction.icon ? <primaryAction.icon className="w-4 h-4" /> : null}
                    {primaryAction.label}
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={primaryAction.onClick}
                    className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold shadow-lg transition-all active:scale-[0.97] ${a.btn}`}
                  >
                    {primaryAction.icon ? <primaryAction.icon className="w-4 h-4" /> : null}
                    {primaryAction.label}
                  </button>
                )
              ) : showHome ? (
                <Link
                  to="/"
                  className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold shadow-lg transition-all active:scale-[0.97] ${a.btn}`}
                >
                  <Home className="w-4 h-4" /> На главную
                </Link>
              ) : null}

              <button
                type="button"
                onClick={handleBack}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-200 bg-white/60 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 ring-1 ring-slate-200/70 dark:ring-white/10 transition-all active:scale-[0.97]"
              >
                <ArrowLeft className="w-4 h-4" /> Назад
              </button>

              {showReload && (
                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-200 bg-white/60 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 ring-1 ring-slate-200/70 dark:ring-white/10 transition-all active:scale-[0.97]"
                >
                  <RefreshCw className="w-4 h-4" /> Обновить
                </button>
              )}
            </div>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-slate-400">КвитиФай — путь без сигарет, шаг за шагом 🌿</p>
      </motion.div>
    </div>
  )
}

export function NotFoundPage() {
  return <ErrorPage status={404} />
}

export function ForbiddenPage() {
  return <ErrorPage status={403} />
}

export function ServerErrorPage() {
  return <ErrorPage status={500} showReload />
}
