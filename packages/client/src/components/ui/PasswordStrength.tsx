interface PasswordStrengthProps {
  password: string
}

interface Score {
  level: 0 | 1 | 2 | 3
  label: string
  hints: string[]
  color: string
}

function score(password: string): Score {
  const hints: string[] = []
  let strength = 0

  if (password.length >= 8) strength++
  else hints.push('минимум 8 символов')

  if (/[A-ZА-ЯЁ]/.test(password)) strength++
  else hints.push('заглавная буква')

  if (/[a-zа-яё]/.test(password)) strength++
  else hints.push('строчная буква')

  if (/\d/.test(password)) strength++
  else hints.push('цифра')

  if (/[^A-Za-zА-Яа-яЁё0-9]/.test(password) && password.length >= 12) strength++

  if (password.length === 0) {
    return { level: 0, label: '', hints: [], color: 'bg-slate-300' }
  }
  if (strength <= 2) {
    return { level: 1, label: 'Слабый', hints, color: 'bg-rose-500' }
  }
  if (strength === 3) {
    return { level: 2, label: 'Средний', hints, color: 'bg-amber-500' }
  }
  return {
    level: 3,
    label: strength >= 5 ? 'Очень надёжный' : 'Надёжный',
    hints,
    color: 'bg-emerald-500',
  }
}

export function PasswordStrength({ password }: PasswordStrengthProps) {
  if (!password) return null
  const s = score(password)
  const segments = 3

  return (
    <div className="space-y-1.5">
      <div className="flex gap-1">
        {Array.from({ length: segments }).map((_, i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors ${
              i < s.level ? s.color : 'bg-slate-200 dark:bg-white/10'
            }`}
          />
        ))}
      </div>
      <div className="flex flex-wrap items-baseline justify-between gap-2 text-xs">
        <span
          className={
            s.level >= 3
              ? 'text-emerald-600 dark:text-emerald-400 font-medium'
              : s.level === 2
                ? 'text-amber-600 dark:text-amber-400 font-medium'
                : 'text-rose-600 dark:text-rose-400 font-medium'
          }
        >
          {s.label}
        </span>
        {s.hints.length > 0 && (
          <span className="text-slate-500 dark:text-slate-400">
            Не хватает: {s.hints.join(', ')}
          </span>
        )}
      </div>
    </div>
  )
}
