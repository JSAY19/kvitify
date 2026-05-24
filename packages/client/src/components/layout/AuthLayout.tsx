import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

interface AuthLayoutProps {
  title: string
  subtitle: string
  children: ReactNode
  footer?: ReactNode
}

export function AuthLayout({ title, subtitle, children, footer }: AuthLayoutProps) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-teal-50 dark:from-slate-950 dark:via-slate-900 dark:to-emerald-950">
      <div aria-hidden className="pointer-events-none absolute inset-0 auth-grid-bg" />

      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 -left-20 w-[28rem] h-[28rem] rounded-full bg-emerald-400/40 dark:bg-emerald-500/20 blur-3xl animate-blob" />
        <div
          className="absolute top-1/3 -right-24 w-[26rem] h-[26rem] rounded-full bg-teal-400/40 dark:bg-teal-500/20 blur-3xl animate-blob"
          style={{ animationDelay: '-5s' }}
        />
        <div
          className="absolute -bottom-32 left-1/4 w-[30rem] h-[30rem] rounded-full bg-amber-300/30 dark:bg-amber-500/15 blur-3xl animate-blob"
          style={{ animationDelay: '-9s' }}
        />
      </div>

      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(15,23,42,0.25)_100%)] dark:bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,0.55)_100%)]" />

      <div className="relative min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="w-full max-w-sm"
        >
          <div className="relative rounded-3xl p-[1.5px] bg-gradient-to-br from-white/60 via-emerald-200/40 to-teal-300/40 dark:from-white/10 dark:via-emerald-400/20 dark:to-teal-400/20 shadow-2xl shadow-emerald-900/10 dark:shadow-black/40">
            <div className="rounded-3xl bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-white/40 dark:border-white/5 p-7 sm:p-8">
              <div className="flex flex-col items-center text-center mb-6">
                <motion.div
                  initial={{ scale: 0.85, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 16, delay: 0.1 }}
                  className="relative mb-2"
                >
                  <motion.span
                    aria-hidden
                    className="absolute -inset-6 rounded-full bg-emerald-400/40 dark:bg-emerald-400/30 blur-3xl"
                    animate={{ scale: [1, 1.12, 1], opacity: [0.55, 0.9, 0.55] }}
                    transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
                  />
                  <img
                    src="/icons/logo.png"
                    alt="КвитиФай"
                    width={128}
                    height={128}
                    className="relative w-28 h-28 sm:w-32 sm:h-32 object-contain logo-glow"
                  />
                </motion.div>

                <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-500 dark:from-emerald-300 dark:via-teal-300 dark:to-emerald-200 bg-clip-text text-transparent">
                  {title}
                </h1>
                <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-400">{subtitle}</p>
              </div>

              {children}

              {footer && (
                <div className="mt-6 pt-5 border-t border-slate-200/70 dark:border-white/5 text-center text-sm text-slate-600 dark:text-slate-400">
                  {footer}
                </div>
              )}
            </div>
          </div>

          <p className="mt-6 text-center text-xs text-slate-500 dark:text-slate-500">
            КвитиФай — твой путь к свободе от курения
          </p>
        </motion.div>
      </div>
    </div>
  )
}
