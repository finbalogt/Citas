'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  format, addMonths, subMonths, startOfMonth, endOfMonth,
  eachDayOfInterval, isSameDay, isBefore, isAfter, startOfDay,
  addDays, parseISO, getDay,
} from 'date-fns'
import { es } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import type { Tenant, Service, Staff } from '@/types/database'

interface Props {
  tenant: Tenant
  service: Service
  staff: Staff | null
  selected: Date | null
  onSelect: (time: Date) => void
}

const DAY_HEADERS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

export default function DateTimeStep({ tenant, service, staff, selected, onSelect }: Props) {
  const today = startOfDay(new Date())
  const maxDate = addDays(today, tenant.max_advance_days)

  const [month, setMonth] = useState(startOfMonth(today))
  const [selectedDate, setSelectedDate] = useState<Date | null>(
    selected ? startOfDay(selected) : null
  )
  const [slots, setSlots] = useState<Date[]>([])
  const [loading, setLoading] = useState(false)

  // Días del mes con padding inicial
  const monthStart = startOfMonth(month)
  const monthEnd   = endOfMonth(month)
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd })
  const startPad = getDay(monthStart) // 0=Dom

  const fetchSlots = useCallback(async (date: Date) => {
    setLoading(true)
    setSlots([])
    const params = new URLSearchParams({
      tenant_id:  tenant.id,
      service_id: service.id,
      date:       format(date, 'yyyy-MM-dd'),
    })
    if (staff) params.set('staff_id', staff.id)
    try {
      const res = await fetch(`/api/availability?${params}`)
      const data = await res.json()
      setSlots((data.slots ?? []).map((s: string) => parseISO(s)))
    } finally {
      setLoading(false)
    }
  }, [tenant.id, service.id, staff])

  useEffect(() => {
    if (selectedDate) fetchSlots(selectedDate)
  }, [selectedDate, fetchSlots])

  function selectDay(d: Date) {
    const isPast   = isBefore(d, today)
    const isFuture = isAfter(d, maxDate)
    if (isPast || isFuture) return
    setSelectedDate(d)
    setSlots([])
  }

  function prevMonth() {
    const prev = subMonths(month, 1)
    if (isBefore(endOfMonth(prev), today)) return
    setMonth(prev)
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-1" style={{ color: 'var(--color-text)' }}>
        ¿Cuándo quieres tu cita?
      </h2>
      <p className="text-sm opacity-50 mb-5" style={{ color: 'var(--color-text)' }}>
        Elige el día y la hora disponible
      </p>

      {/* ─── Calendario mensual ────────────────────────────────── */}
      <div className="rounded-2xl p-4 mb-5" style={{ background: 'rgba(0,0,0,0.04)', borderRadius: 'var(--border-radius)' }}>
        {/* Header mes */}
        <div className="flex items-center justify-between mb-4">
          <button onClick={prevMonth}
            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-black/8 transition-colors"
            style={{ color: 'var(--color-text)' }}>
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-sm font-semibold capitalize" style={{ color: 'var(--color-text)' }}>
            {format(month, 'MMMM yyyy', { locale: es })}
          </span>
          <button onClick={() => setMonth(m => addMonths(m, 1))}
            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-black/8 transition-colors"
            style={{ color: 'var(--color-text)' }}>
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Cabecera días */}
        <div className="grid grid-cols-7 mb-1">
          {DAY_HEADERS.map(d => (
            <div key={d} className="text-center text-[10px] font-semibold uppercase opacity-40 py-1"
              style={{ color: 'var(--color-text)' }}>
              {d}
            </div>
          ))}
        </div>

        {/* Grid días */}
        <div className="grid grid-cols-7 gap-y-1">
          {/* Padding inicial */}
          {Array.from({ length: startPad }).map((_, i) => <div key={`pad-${i}`} />)}

          {daysInMonth.map(day => {
            const isPast     = isBefore(day, today)
            const isFuture   = isAfter(day, maxDate)
            const isSelected = selectedDate && isSameDay(day, selectedDate)
            const isToday    = isSameDay(day, today)
            const disabled   = isPast || isFuture

            return (
              <button
                key={day.toISOString()}
                onClick={() => selectDay(day)}
                disabled={disabled}
                className="relative flex flex-col items-center justify-center h-9 rounded-xl text-sm transition-all"
                style={{
                  background: isSelected
                    ? 'var(--color-primary)'
                    : isToday
                      ? 'rgba(0,0,0,0.08)'
                      : 'transparent',
                  color: isSelected
                    ? '#fff'
                    : disabled
                      ? 'rgba(0,0,0,0.2)'
                      : 'var(--color-text)',
                  fontWeight: isToday || isSelected ? 700 : 400,
                  cursor: disabled ? 'not-allowed' : 'pointer',
                }}
              >
                {format(day, 'd')}
                {isToday && !isSelected && (
                  <span className="absolute bottom-1 w-1 h-1 rounded-full"
                    style={{ background: 'var(--color-primary)' }} />
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* ─── Slots de hora ─────────────────────────────────────── */}
      {selectedDate && (
        <div className="step-enter">
          <p className="text-sm font-semibold mb-3 capitalize" style={{ color: 'var(--color-text)' }}>
            {format(selectedDate, "EEEE d 'de' MMMM", { locale: es })}
          </p>

          {loading ? (
            <div className="flex items-center justify-center py-10 gap-2 opacity-40">
              <Loader2 className="w-5 h-5 animate-spin" style={{ color: 'var(--color-text)' }} />
              <span className="text-sm" style={{ color: 'var(--color-text)' }}>Cargando horarios...</span>
            </div>
          ) : slots.length === 0 ? (
            <div className="text-center py-10 rounded-2xl" style={{ background: 'rgba(0,0,0,0.04)', borderRadius: 'var(--border-radius)' }}>
              <p className="text-3xl mb-2">😴</p>
              <p className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>Sin horarios disponibles</p>
              <p className="text-xs opacity-40 mt-1" style={{ color: 'var(--color-text)' }}>
                Prueba otro día
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {slots.map(slot => {
                const isSelected = selected && isSameDay(slot, selected) && slot.getTime() === selected.getTime()
                return (
                  <button
                    key={slot.toISOString()}
                    onClick={() => onSelect(slot)}
                    className="py-3 rounded-xl text-sm font-medium transition-all"
                    style={{
                      background: isSelected ? 'var(--color-primary)' : 'rgba(0,0,0,0.05)',
                      color:      isSelected ? '#fff' : 'var(--color-text)',
                      border:     `2px solid ${isSelected ? 'var(--color-primary)' : 'transparent'}`,
                      borderRadius: 'var(--border-radius)',
                    }}
                  >
                    {format(slot, 'h:mm a')}
                  </button>
                )
              })}
            </div>
          )}
        </div>
      )}

      {!selectedDate && (
        <p className="text-center text-sm opacity-40 py-4" style={{ color: 'var(--color-text)' }}>
          Selecciona un día para ver los horarios disponibles
        </p>
      )}
    </div>
  )
}
