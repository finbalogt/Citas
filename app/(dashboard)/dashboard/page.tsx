import { createClient } from '@/lib/supabase/server'
import { getTenantForCurrentUser } from '@/lib/tenant/resolver'
import { redirect } from 'next/navigation'
import { formatTime, formatCurrency, STATUS_LABELS, STATUS_COLORS } from '@/lib/utils'
import { format, startOfDay, addDays, isSameDay } from 'date-fns'
import { es } from 'date-fns/locale'
import { Calendar, DollarSign, Users, AlertTriangle, Plus, ExternalLink, CalendarOff } from 'lucide-react'
import Link from 'next/link'
import type { Appointment } from '@/types/database'

export default async function DashboardPage() {
  const tenant = await getTenantForCurrentUser()
  if (!tenant) redirect('/register')

  const supabase = await createClient()
  const now        = new Date()
  const todayStart = startOfDay(now).toISOString()
  const weekEnd    = addDays(startOfDay(now), 7).toISOString()

  // Cierres próximos del negocio (para acceso rápido)
  const { data: upcomingClosures } = await supabase
    .from('blocked_times')
    .select('id, start_at, end_at, reason, staff_id')
    .eq('tenant_id', tenant.id)
    .is('staff_id', null)
    .gte('end_at', now.toISOString())
    .order('start_at')
    .limit(3)

  const { data: upcomingAppts } = await supabase
    .from('appointments')
    .select('*, staff(*), service:services(*), client:clients(*)')
    .eq('tenant_id', tenant.id)
    .gte('starts_at', todayStart)
    .lte('starts_at', weekEnd)
    .order('starts_at')

  const appts    = (upcomingAppts ?? []) as Appointment[]
  const today    = appts.filter(a => isSameDay(new Date(a.starts_at), now))
  const confirmed = today.filter(a => a.status === 'confirmed')
  const totalRev  = confirmed.reduce((acc, a) => acc + a.price_total, 0)
  const noShows   = today.filter(a => a.status === 'no_show').length
  const pending   = appts.filter(a => a.status === 'pending').length

  const stats = [
    { icon: Calendar,      label: 'Citas hoy',          value: today.length.toString(),     color: 'text-blue-400',   bg: 'bg-blue-500/10'   },
    { icon: DollarSign,    label: 'Ingresos hoy',        value: formatCurrency(totalRev),    color: 'text-green-400',  bg: 'bg-green-500/10'  },
    { icon: Users,         label: 'Pendientes (7 días)', value: pending.toString(),           color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
    { icon: AlertTriangle, label: 'No se presentaron',   value: noShows.toString(),           color: 'text-red-400',    bg: 'bg-red-500/10'    },
  ]

  // Group appointments by day
  const grouped = appts.reduce((acc, a) => {
    const key = format(new Date(a.starts_at), 'yyyy-MM-dd')
    if (!acc[key]) acc[key] = []
    acc[key].push(a)
    return acc
  }, {} as Record<string, Appointment[]>)

  return (
    <div className="px-6 py-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">
            {format(new Date(), "EEEE d 'de' MMMM", { locale: es })}
          </h1>
          <p className="text-sm text-[#64748b] mt-0.5">Panel de {tenant.name}</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/b/${tenant.slug}`} target="_blank"
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs text-[#64748b] hover:text-white border border-white/8 hover:border-white/15 transition-colors">
            <ExternalLink className="w-3.5 h-3.5" />
            Ver página
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(s => (
          <div key={s.label} className="rounded-xl p-4" style={{ background: 'var(--app-surface)', border: '1px solid var(--app-border)' }}>
            <div className={`w-9 h-9 rounded-lg ${s.bg} ${s.color} flex items-center justify-center mb-3`}>
              <s.icon className="w-4.5 h-4.5" />
            </div>
            <p className="text-2xl font-bold text-white">{s.value}</p>
            <p className="text-xs text-[#64748b] mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Acceso rápido — Cierres del negocio */}
      <div className="rounded-xl mb-6" style={{ background: 'var(--app-surface)', border: '1px solid var(--app-border)' }}>
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'var(--app-border)' }}>
          <div className="flex items-center gap-2">
            <CalendarOff className="w-4 h-4 text-violet-400" />
            <h2 className="text-sm font-semibold text-white">Cierres del negocio</h2>
          </div>
          <Link href="/dashboard/closures" className="text-xs text-violet-400 hover:text-violet-300 transition-colors">
            Gestionar →
          </Link>
        </div>
        {(upcomingClosures?.length ?? 0) === 0 ? (
          <div className="px-5 py-5 flex items-center justify-between">
            <p className="text-sm text-[#64748b]">Sin cierres próximos registrados</p>
            <Link
              href="/dashboard/closures"
              className="flex items-center gap-1.5 text-xs text-violet-400 hover:text-violet-300 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Agregar cierre
            </Link>
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: 'var(--app-border)' }}>
            {upcomingClosures!.map(c => (
              <div key={c.id} className="flex items-center justify-between px-5 py-3">
                <div>
                  <p className="text-sm text-white">
                    {format(new Date(c.start_at), "d 'de' MMMM", { locale: es })}
                    {c.start_at.slice(0, 10) !== c.end_at.slice(0, 10) && (
                      <> — {format(new Date(c.end_at), "d 'de' MMMM", { locale: es })}</>
                    )}
                  </p>
                  {c.reason && <p className="text-xs text-[#64748b] mt-0.5">{c.reason}</p>}
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-400">
                  Cierre
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Próximas citas */}
      <div className="rounded-xl overflow-hidden" style={{ background: 'var(--app-surface)', border: '1px solid var(--app-border)' }}>
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'var(--app-border)' }}>
          <h2 className="text-sm font-semibold text-white">Próximas citas</h2>
          <Link href="/dashboard/appointments" className="text-xs text-violet-400 hover:text-violet-300 transition-colors">
            Ver todas →
          </Link>
        </div>

        {appts.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <Calendar className="w-8 h-8 text-[#1a1a28] mx-auto mb-3" />
            <p className="text-sm text-[#64748b]">Sin citas próximas</p>
            <Link href={`/b/${tenant.slug}/book`} target="_blank"
              className="inline-flex items-center gap-1.5 mt-3 text-xs text-violet-400 hover:text-violet-300">
              <Plus className="w-3.5 h-3.5" />
              Compartir página de reservas
            </Link>
          </div>
        ) : (
          <div>
            {Object.entries(grouped).map(([dateKey, dayAppts]) => {
              const date = new Date(dateKey + 'T12:00:00')
              const isToday = isSameDay(date, now)
              const label = isToday
                ? 'Hoy'
                : format(date, "EEEE d 'de' MMMM", { locale: es })
              return (
                <div key={dateKey}>
                  <div className="px-5 py-2 border-b" style={{ borderColor: 'var(--app-border)', background: 'rgba(255,255,255,0.02)' }}>
                    <p className="text-xs font-semibold uppercase tracking-wide text-[#64748b] capitalize">{label}</p>
                  </div>
                  <div className="divide-y" style={{ borderColor: 'var(--app-border)' }}>
                    {dayAppts.map(a => {
                      const staff = a.staff as { name: string } | null
                      const service = a.service as { name: string } | null
                      const client = a.client as { name: string; phone: string } | null
                      return (
                        <div key={a.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-white/2 transition-colors">
                          <div className="text-center w-14 shrink-0">
                            <p className="text-sm font-semibold text-white">{formatTime(a.starts_at)}</p>
                            <p className="text-xs text-[#64748b]">{(a.service as { duration_min?: number })?.duration_min}min</p>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">{client?.name ?? 'Sin nombre'}</p>
                            <p className="text-xs text-[#64748b] truncate">{service?.name} · {staff?.name}</p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className={`text-xs px-2 py-0.5 rounded-full border ${STATUS_COLORS[a.status]}`}>
                              {STATUS_LABELS[a.status]}
                            </span>
                            <span className="text-sm font-semibold text-white">{formatCurrency(a.price_total)}</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
