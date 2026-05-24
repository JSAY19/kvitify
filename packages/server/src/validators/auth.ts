import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('Некорректный email').max(254),
  password: z
    .string()
    .min(8, 'Пароль минимум 8 символов')
    .max(72, 'Пароль слишком длинный')
    .regex(/[A-ZА-ЯЁ]/, 'Нужна заглавная буква')
    .regex(/[a-zа-яё]/, 'Нужна строчная буква')
    .regex(/\d/, 'Нужна цифра'),
  name: z.string().min(2, 'Имя минимум 2 символа').max(50),
});

export const loginSchema = z.object({
  email: z.string().email('Некорректный email'),
  password: z.string().min(1, 'Введите пароль'),
});
