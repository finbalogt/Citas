import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { addHours } from 'date-fns'

interface AppointmentData {
  businessName: string
  serviceName: string
  staffName: string
  startsAt: Date
  address?: string
  bookingUrl?: string
}

export function buildConfirmationMsg(data: AppointmentData): string {
  const fecha = format(data.startsAt, "EEEE d 'de' MMMM", { locale: es })
  const hora  = format(data.startsAt, 'h:mm a')
  const limite = format(addHours(data.startsAt, -24), "EEEE d 'de' MMMM 'a las' h:mm a", { locale: es })

  return [
    `✅ *¡Cita confirmada en ${data.businessName}!*`,
    '',
    `📅 ${fecha}`,
    `⏰ ${hora}`,
    `✂️  ${data.serviceName}`,
    `👤 Con: ${data.staffName}`,
    data.address ? `📍 ${data.address}` : '',
    '',
    `⚠️ _Para cancelar sin costo, hazlo antes del ${limite}._`,
  ].filter(l => l !== null).join('\n')
}

export function buildReminder24hMsg(data: AppointmentData): string {
  const hora = format(data.startsAt, 'h:mm a')
  return [
    `⏰ *Recordatorio de cita — ${data.businessName}*`,
    '',
    `Mañana tienes cita a las *${hora}* con ${data.staffName}`,
    `✂️  ${data.serviceName}`,
    data.address ? `📍 ${data.address}` : '',
    '',
    '¿No puedes asistir? Contáctanos para cancelar.',
  ].filter(l => l !== null).join('\n')
}

export function buildReminder2hMsg(data: AppointmentData): string {
  const hora = format(data.startsAt, 'h:mm a')
  return [
    `💈 *¡Tu cita es en 2 horas!*`,
    '',
    `⏰ Hoy a las *${hora}* con ${data.staffName}`,
    data.address ? `📍 ${data.address}` : '',
    '',
    `¡Te esperamos en ${data.businessName}! 🙌`,
  ].filter(l => l !== null).join('\n')
}

export function buildCancellationMsg(data: AppointmentData): string {
  const fecha = format(data.startsAt, "d 'de' MMMM", { locale: es })
  const hora  = format(data.startsAt, 'h:mm a')
  return [
    `❌ *Cita cancelada — ${data.businessName}*`,
    '',
    `Tu cita del ${fecha} a las ${hora} fue cancelada.`,
    data.bookingUrl ? `\nPuedes reagendar en: ${data.bookingUrl}` : '',
    '',
    '¡Esperamos verte pronto! 😊',
  ].filter(l => l !== null).join('\n')
}
