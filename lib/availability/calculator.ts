import {
  addMinutes, addHours, setHours, setMinutes, setSeconds, setMilliseconds,
  isBefore, isAfter, parseISO,
} from 'date-fns'
import type { Schedule, Appointment, BlockedTime } from '@/types/database'

interface SlotParams {
  schedule: Schedule
  appointments: Appointment[]
  blockedTimes: BlockedTime[]
  serviceDuration: number   // minutos
  date: Date
  minAdvanceHours: number
  slotInterval: number      // minutos entre slots (30 o 60)
}

function parseTimeToDate(base: Date, time: string): Date {
  const [h, m] = time.split(':').map(Number)
  return setMilliseconds(setSeconds(setMinutes(setHours(base, h), m), 0), 0)
}

export function getAvailableSlots(params: SlotParams): Date[] {
  const { schedule, appointments, blockedTimes, serviceDuration, date, minAdvanceHours, slotInterval } = params

  if (!schedule.is_working) return []

  const dayStart = parseTimeToDate(date, schedule.start_time)
  const dayEnd   = parseTimeToDate(date, schedule.end_time)
  const minStart = addHours(new Date(), minAdvanceHours)

  const breakStart = schedule.break_start ? parseTimeToDate(date, schedule.break_start) : null
  const breakEnd   = schedule.break_end   ? parseTimeToDate(date, schedule.break_end)   : null

  const slots: Date[] = []
  let current = new Date(dayStart)

  while (isBefore(current, dayEnd)) {
    const slotEnd = addMinutes(current, serviceDuration)

    // Fuera del horario laboral
    if (isAfter(slotEnd, dayEnd)) break

    // En el pasado (o muy próximo)
    if (isBefore(current, minStart)) {
      current = addMinutes(current, slotInterval)
      continue
    }

    // Overlap con descanso
    if (breakStart && breakEnd) {
      if (isBefore(current, breakEnd) && isAfter(slotEnd, breakStart)) {
        current = addMinutes(current, slotInterval)
        continue
      }
    }

    // Overlap con cita existente
    const overlapsAppt = appointments.some(a => {
      if (a.status === 'cancelled') return false
      const aStart = parseISO(a.starts_at)
      const aEnd   = parseISO(a.ends_at)
      return isBefore(current, aEnd) && isAfter(slotEnd, aStart)
    })

    // Overlap con tiempo bloqueado
    const overlapsBlock = blockedTimes.some(b => {
      const bStart = parseISO(b.start_at)
      const bEnd   = parseISO(b.end_at)
      return isBefore(current, bEnd) && isAfter(slotEnd, bStart)
    })

    if (!overlapsAppt && !overlapsBlock) {
      slots.push(new Date(current))
    }

    current = addMinutes(current, slotInterval)
  }

  return slots
}
