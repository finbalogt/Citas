import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, formatDistanceToNow, isToday, isTomorrow } from 'date-fns'
import { es } from 'date-fns/locale'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency = 'Q') {
  return `${currency} ${amount.toFixed(2)}`
}

export function formatDateTime(date: string | Date) {
  const d = typeof date === 'string' ? new Date(date) : date
  if (isToday(d)) return `Hoy ${format(d, 'h:mm a')}`
  if (isTomorrow(d)) return `Mañana ${format(d, 'h:mm a')}`
  return format(d, "EEEE d 'de' MMMM, h:mm a", { locale: es })
}

export function formatDate(date: string | Date) {
  const d = typeof date === 'string' ? new Date(date) : date
  if (isToday(d)) return 'Hoy'
  if (isTomorrow(d)) return 'Mañana'
  return format(d, "EEEE d 'de' MMMM", { locale: es })
}

export function formatTime(date: string | Date) {
  const d = typeof date === 'string' ? new Date(date) : date
  return format(d, 'h:mm a')
}

export function formatRelative(date: string | Date) {
  const d = typeof date === 'string' ? new Date(date) : date
  return formatDistanceToNow(d, { locale: es, addSuffix: true })
}

export function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

export const APP_CONFIG = {
  name: process.env.NEXT_PUBLIC_SAAS_NAME ?? 'AgendaHub',
  domain: process.env.NEXT_PUBLIC_APP_DOMAIN ?? 'localhost:3000',
  url: process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
}

export const STATUS_LABELS: Record<string, string> = {
  pending:    'Pendiente',
  confirmed:  'Confirmada',
  completed:  'Completada',
  cancelled:  'Cancelada',
  no_show:    'No se presentó',
}

export const STATUS_COLORS: Record<string, string> = {
  pending:   'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  confirmed: 'bg-green-500/10 text-green-400 border-green-500/20',
  completed: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  cancelled: 'bg-red-500/10 text-red-400 border-red-500/20',
  no_show:   'bg-gray-500/10 text-gray-400 border-gray-500/20',
}
