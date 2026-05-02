import { createClient } from '@/lib/supabase/server'
import { getTenantForCurrentUser } from '@/lib/tenant/resolver'
import { redirect } from 'next/navigation'
import { formatCurrency } from '@/lib/utils'
import { Scissors, Clock } from 'lucide-react'
import AddServiceModal from '@/components/dashboard/AddServiceModal'

export default async function ServicesPage() {
  const tenant = await getTenantForCurrentUser()
  if (!tenant) redirect('/login')

  const supabase = await createClient()
  const { data: services } = await supabase
    .from('services')
    .select('*')
    .eq('tenant_id', tenant.id)
    .order('sort_order')

  return (
    <div className="px-6 py-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Servicios</h1>
          <p className="text-sm text-[#64748b] mt-0.5">{services?.length ?? 0} servicios</p>
        </div>
        <AddServiceModal tenantId={tenant.id} />
      </div>

      {(services?.length ?? 0) === 0 ? (
        <div className="rounded-xl px-5 py-16 text-center" style={{ background: 'var(--app-surface)', border: '1px solid var(--app-border)' }}>
          <Scissors className="w-8 h-8 text-[#1a1a28] mx-auto mb-3" />
          <p className="text-[#64748b] text-sm">No hay servicios registrados</p>
        </div>
      ) : (
        <div className="rounded-xl overflow-hidden" style={{ background: 'var(--app-surface)', border: '1px solid var(--app-border)' }}>
          <div className="hidden md:grid grid-cols-[1fr_80px_100px_80px_48px] gap-4 px-5 py-3 text-xs font-medium text-[#64748b] uppercase tracking-wide border-b" style={{ borderColor: 'var(--app-border)' }}>
            <span>Servicio</span>
            <span>Duración</span>
            <span>Precio</span>
            <span>Estado</span>
            <span />
          </div>
          <div className="divide-y" style={{ borderColor: 'var(--app-border)' }}>
            {services!.map(s => (
              <div key={s.id} className="grid grid-cols-1 md:grid-cols-[1fr_80px_100px_80px_48px] gap-2 md:gap-4 px-5 py-4 items-center hover:bg-white/2 transition-colors">
                <div>
                  <p className="text-sm font-medium text-white">{s.name}</p>
                  {s.description && <p className="text-xs text-[#64748b]">{s.description}</p>}
                  <span className="text-xs text-[#64748b] capitalize">{s.category}</span>
                </div>
                <p className="text-sm text-[#94a3b8] flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {s.duration_min}min
                </p>
                <p className="text-sm font-semibold text-white">{formatCurrency(s.price)}</p>
                <span className={`text-xs px-2 py-0.5 rounded-full w-fit ${s.is_active ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                  {s.is_active ? 'Activo' : 'Inactivo'}
                </span>
                <button className="text-xs text-violet-400 hover:text-violet-300 transition-colors">
                  Editar
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
