import { Suspense } from 'react'
import Link from 'next/link'
import { getTenantBySlug } from '@/lib/tenant/resolver'
import { notFound } from 'next/navigation'
import { CheckCircle2, Calendar, Clock, User, MapPin, ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { formatDateTime } from '@/lib/utils'

interface Props {
  params: Promise<{ tenant: string }>
  searchParams: Promise<{ appointment?: string }>
}

export default async function ConfirmationPage({ params, searchParams }: Props) {
  const { tenant: slug } = await params
  const { appointment: appointmentId } = await searchParams

  const tenant = await getTenantBySlug(slug)
  if (!tenant) notFound()

  let appointment = null
  if (appointmentId) {
    const supabase = await createClient()
    const { data } = await supabase
      .from('appointments')
      .select('*, staff(*), service:services(*), client:clients(*)')
      .eq('id', appointmentId)
      .single()
    appointment = data
  }

  return (
    <div className="min-h-dvh flex items-center justify-center px-4 py-12" style={{ background: 'var(--color-bg)' }}>
      <div className="w-full max-w-sm">
        {/* Icono de éxito */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ background: 'rgba(34,197,94,0.1)' }}>
            <CheckCircle2 className="w-10 h-10 text-green-500" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-center mb-1" style={{ color: 'var(--color-text)' }}>
          ¡Cita confirmada!
        </h1>
        <p className="text-center text-sm opacity-50 mb-6" style={{ color: 'var(--color-text)' }}>
          {tenant.whatsapp ? 'Te enviamos un mensaje de WhatsApp con los detalles.' : 'Tu cita fue registrada exitosamente.'}
        </p>

        {appointment && (
          <div className="rounded-2xl p-5 space-y-3 mb-6" style={{ background: 'rgba(0,0,0,0.04)', borderRadius: 'var(--border-radius)', color: 'var(--color-text)' }}>
            <div className="flex items-center gap-3 text-sm">
              <Calendar className="w-4 h-4 opacity-50 shrink-0" />
              <span>{formatDateTime(appointment.starts_at)}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Clock className="w-4 h-4 opacity-50 shrink-0" />
              <span>{(appointment.service as { duration_min: number })?.duration_min} minutos</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <User className="w-4 h-4 opacity-50 shrink-0" />
              <span>Con: {(appointment.staff as { name: string })?.name}</span>
            </div>
            {tenant.address && (
              <div className="flex items-center gap-3 text-sm">
                <MapPin className="w-4 h-4 opacity-50 shrink-0" />
                <span>{tenant.address}</span>
              </div>
            )}
          </div>
        )}

        {tenant.cancel_hours > 0 && (
          <p className="text-xs text-center opacity-40 mb-6" style={{ color: 'var(--color-text)' }}>
            Puedes cancelar sin costo hasta {tenant.cancel_hours} horas antes.
          </p>
        )}

        <Link
          href={`/b/${slug}`}
          className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-medium text-sm transition-opacity hover:opacity-90"
          style={{ background: 'var(--color-primary)', color: '#fff', borderRadius: 'var(--border-radius)' }}
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al inicio
        </Link>
      </div>
    </div>
  )
}
