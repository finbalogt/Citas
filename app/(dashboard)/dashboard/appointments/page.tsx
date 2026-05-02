import { createClient } from '@/lib/supabase/server'
import { getTenantForCurrentUser } from '@/lib/tenant/resolver'
import { redirect } from 'next/navigation'
import { formatDateTime, formatCurrency, STATUS_LABELS, STATUS_COLORS } from '@/lib/utils'
import { subDays, addDays } from 'date-fns'
import type { Appointment } from '@/types/database'
import AppointmentActions from '@/components/dashboard/AppointmentActions'

export default async function AppointmentsPage() {
  const tenant = await getTenantForCurrentUser()
  if (!tenant) redirect('/login')

  const supabase = await createClient()
  const { data } = await supabase
    .from('appointments')
    .select('*, staff(*), service:services(*), client:clients(*)')
    .eq('tenant_id', tenant.id)
    .gte('starts_at', subDays(new Date(), 1).toISOString())
    .lte('starts_at', addDays(new Date(), 30).toISOString())
    .order('starts_at')

  const appointments = (data ?? []) as Appointment[]

  return (
    <div className="px-6 py-8 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Citas</h1>
        <p className="text-sm text-[#64748b] mt-0.5">Próximos 30 días</p>
      </div>

      <div className="rounded-xl overflow-hidden" style={{ background: 'var(--app-surface)', border: '1px solid var(--app-border)' }}>
        {appointments.length === 0 ? (
          <div className="px-5 py-16 text-center">
            <p className="text-[#64748b] text-sm">No hay citas próximas</p>
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: 'var(--app-border)' }}>
            {/* Header */}
            <div className="hidden md:grid grid-cols-[1fr_1fr_1fr_120px_90px_48px] gap-4 px-5 py-3 text-xs font-medium text-[#64748b] uppercase tracking-wide">
              <span>Cliente</span>
              <span>Servicio</span>
              <span>Fecha y hora</span>
              <span>Total</span>
              <span>Estado</span>
              <span />
            </div>
            {appointments.map(a => {
              const staff = a.staff as { name: string } | null
              const service = a.service as { name: string; duration_min: number } | null
              const client = a.client as { name: string; phone: string } | null
              return (
                <div key={a.id} className="grid grid-cols-1 md:grid-cols-[1fr_1fr_1fr_120px_90px_48px] gap-2 md:gap-4 px-5 py-4 hover:bg-white/2 transition-colors items-center">
                  <div>
                    <p className="text-sm font-medium text-white">{client?.name ?? '—'}</p>
                    <p className="text-xs text-[#64748b]">{client?.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-[#94a3b8]">{service?.name}</p>
                    <p className="text-xs text-[#64748b]">{staff?.name} · {service?.duration_min}min</p>
                  </div>
                  <p className="text-sm text-[#94a3b8]">{formatDateTime(a.starts_at)}</p>
                  <p className="text-sm font-semibold text-white">{formatCurrency(a.price_total)}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full border w-fit ${STATUS_COLORS[a.status]}`}>
                    {STATUS_LABELS[a.status]}
                  </span>
                  <AppointmentActions appointmentId={a.id} status={a.status} tenantId={tenant.id} />
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
