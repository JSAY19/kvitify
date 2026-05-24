import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'
import { AuthLayout } from '../components/layout/AuthLayout'
import { PasswordStrength } from '../components/ui/PasswordStrength'
import { useAuthStore } from '../stores/authStore'

export function RegisterPage() {
  const navigate = useNavigate()
  const register = useAuthStore((s) => s.register)

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await register({ name, email, password })
      navigate('/onboarding')
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error
      setError(msg ?? 'Ошибка регистрации')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      title="Создать аккаунт"
      subtitle="Сделай первый шаг к новой жизни"
      footer={
        <>
          Уже есть аккаунт?{' '}
          <Link
            to="/login"
            className="text-emerald-600 dark:text-emerald-400 hover:underline font-semibold"
          >
            Войти
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {error && (
          <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm border border-red-200 dark:border-red-800/50">
            {error}
          </div>
        )}
        <Input
          label="Имя"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          autoComplete="name"
          placeholder="Как тебя зовут?"
        />
        <Input
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          placeholder="you@example.com"
        />
        <div className="space-y-2">
          <Input
            label="Пароль"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            autoComplete="new-password"
            placeholder="Минимум 8 символов, буквы и цифры"
          />
          <PasswordStrength password={password} />
        </div>
        <Button type="submit" loading={loading} className="w-full">
          Зарегистрироваться
        </Button>
      </form>
    </AuthLayout>
  )
}
