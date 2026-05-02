'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { ArrowLeft, X } from 'lucide-react'
import type { Tenant, Service, Staff } from '@/types/database'
import ServiceStep from './steps/ServiceStep'
import StaffStep from './steps/StaffStep'
import DateTimeStep from './steps/DateTimeStep'
import ClientInfoStep from './steps/ClientInfoStep'
import SummaryStep from './steps/SummaryStep'

export interface BookingData {
  service: Service | null
  staff: Staff | null         // null = sin preferencia
  date: Date | null
  time: Date | null
  clientName: string
  clientPhone: string
  clientNotes: string
}

interface Props {
  tenant: Tenant
  services: Service[]
  staff: (Staff & { staff_services: { service_id: string }[] })[]
  preselectedServiceId?: string
}

const STEPS = ['Servicio', 'Profesional', 'Fecha y hora', 'Tus datos', 'Confirmar']

export default function BookingWizard({ tenant, services, staff, preselectedServiceId }: Props) {
  const router = useRouter()
  const [step, setStep] = useState(preselectedServiceId ? 1 : 0)
  const [submitting, setSubmitting] = useState(false)

  const [booking, setBooking] = useState<BookingData>({
    service:     services.find(s => s.id === preselectedServiceId) ?? null,
    staff:       null,
    date:        null,
    time:        null,
    clientName:  '',
    clientPhone: '',
    clientNotes: '',
  })

  function update(partial: Partial<BookingData>) {
    setBooking(prev => ({ ...prev, ...partial }))
  }

  function next() { setStep(s => Math.min(s + 1, STEPS.length - 1)) }
  function back() { setStep(s => Math.max(s - 1, 0)) }

  async function handleConfirm() {
    if (!booking.service || !booking.time || !booking.clientName || !booking.clientPhone) {
      toast.error('Completa todos los campos')
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenant_id:    tenant.id,
          staff_id:     booking.staff?.id,
          service_id:   booking.service.id,
          starts_at:    booking.time.toISOString(),
          price_total:  booking.service.price,
          client_name:  booking.clientName,
          client_phone: booking.clientPhone,
          client_notes: booking.clientNotes,
          source:       'online',
        }),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error ?? 'Error al confirmar'); setSubmitting(false); return }
      router.push(`/b/${tenant.slug}/confirmation?appointment=${data.id}`)
    } catch {
      toast.error('Error de red, intenta de nuevo')
      setSubmitting(false)
    }
  }

  // Filtrar staff que atiende el servicio seleccionado
  const availableStaff = booking.service
    ? staff.filter(s => s.staff_services.some(ss => ss.service_id === booking.service!.id))
    : staff

  return (
    <div className="min-h-dvh flex flex-col" style={{ background: 'var(--color-bg)', color: 'var(--color-text)' }}>
      {/* Header */}
      <div className="sticky top-0 z-10 px-4 pt-4 pb-3" style={{ background: 'var(--color-bg)', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
        <div className="max-w-lg mx-auto flex items-center gap-3">
          {step > 0 ? (
            <button onClick={back} className="p-1.5 rounded-lg hover:bg-black/5 transition-colors">
              <ArrowLeft className="w-5 h-5" style={{ color: 'var(--color-text)' }} />
            </button>
          ) : (
            <button onClick={() => router.back()} className="p-1.5 rounded-lg hover:bg-black/5 transition-colors">
              <X className="w-5 h-5" style={{ color: 'var(--color-text)' }} />
            </button>
          )}
          <div className="flex-1">
            <p className="text-xs opacity-50 mb-1">{tenant.name}</p>
            <div className="flex gap-1">
              {STEPS.map((_, i) => (
                <div
                  key={i}
                  className="h-1 flex-1 rounded-full transition-all duration-300"
                  style={{ background: i <= step ? 'var(--color-primary)' : 'rgba(0,0,0,0.1)' }}
                />
              ))}
            </div>
          </div>
        </div>
        <div className="max-w-lg mx-auto mt-2 pl-10">
          <p className="text-xs opacity-40">Paso {step + 1} de {STEPS.length} — {STEPS[step]}</p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-lg mx-auto px-4 py-6 step-enter">
          {step === 0 && (
            <ServiceStep
              services={services}
              selected={booking.service}
              onSelect={service => { update({ service, staff: null, date: null, time: null }); next() }}
            />
          )}
          {step === 1 && (
            <StaffStep
              staff={availableStaff}
              selected={booking.staff}
              onSelect={s => { update({ staff: s, date: null, time: null }); next() }}
            />
          )}
          {step === 2 && (
            <DateTimeStep
              tenant={tenant}
              service={booking.service!}
              staff={booking.staff}
              selected={booking.time}
              onSelect={time => { update({ time }); next() }}
            />
          )}
          {step === 3 && (
            <ClientInfoStep
              name={booking.clientName}
              phone={booking.clientPhone}
              notes={booking.clientNotes}
              onChange={update}
              onNext={next}
            />
          )}
          {step === 4 && (
            <SummaryStep
              tenant={tenant}
              booking={booking}
              submitting={submitting}
              onConfirm={handleConfirm}
              onEdit={setStep}
            />
          )}
        </div>
      </div>
    </div>
  )
}
