import { createClient } from '@/lib/supabase/server'
import { getTenantForCurrentUser } from '@/lib/tenant/resolver'
import { redirect } from 'next/navigation'
import { Users } from 'lucide-react'
import AddStaffModal from '@/components/dashboard/AddStaffModal'
import EditStaffModal from '@/components/dashboard/EditStaffModal'

export default async function StaffPage() {
  const tenant = await getTenantForCurrentUser()
  if (!tenant) redirect('/login')

  const supabase = await createClient()

  const [{ data: staff }, { data: services }] = await Promise.all([
    supabase
      .from('staff')
      .select('*, schedules(*), staff_services(service_id)')
      .eq('tenant_id', tenant.id)
      .order('sort_order'),
    supabase
      .from('services')
      .select('id, name')
      .eq('tenant_id', tenant.id)
      .eq('is_active', true)
      .order('sort_order'),
  ])

  return (
    <div className="px-6 py-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Equipo</h1>
          <p className="text-sm text-[#64748b] mt-0.5">{staff?.length ?? 0} profesionales</p>
        </div>
        <AddStaffModal tenantId={tenant.id} />
      </div>

      {(staff?.length ?? 0) === 0 ? (
        <div className="rounded-xl px-5 py-16 text-center" style={{ background: 'var(--app-surface)', border: '1px solid var(--app-border)' }}>
          <Users className="w-8 h-8 text-[#1a1a28] mx-auto mb-3" />
          <p className="text-[#64748b] text-sm">No hay profesionales registrados</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {staff!.map(member => (
            <div key={member.id} className="rounded-xl p-5" style={{ background: 'var(--app-surface)', border: '1px solid var(--app-border)' }}>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold shrink-0 bg-violet-600/20 text-violet-400">
                  {member.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white">{member.name}</p>
                  <p className="text-xs text-[#64748b] capitalize">{member.role}</p>
                  {member.specialty && (
                    <p className="text-xs text-[#64748b] mt-0.5">{member.specialty}</p>
                  )}
                  {/* Servicios asignados */}
                  {(member.staff_services as { service_id: string }[]).length > 0 && (
                    <p className="text-xs text-violet-400 mt-1">
                      {(member.staff_services as { service_id: string }[]).length} servicio
                      {(member.staff_services as { service_id: string }[]).length !== 1 ? 's' : ''} asignado
                      {(member.staff_services as { service_id: string }[]).length !== 1 ? 's' : ''}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${member.is_active ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                    {member.is_active ? 'Activo' : 'Inactivo'}
                  </span>
                  <EditStaffModal
                    staff={member as Parameters<typeof EditStaffModal>[0]['staff']}
                    tenantId={tenant.id}
                    services={services ?? []}
                  />
                </div>
              </div>

              {/* Horario resumen */}
              {(member.schedules as { day_of_week: number; is_working: boolean }[])?.length > 0 && (
                <div className="mt-4 pt-4 border-t" style={{ borderColor: 'var(--app-border)' }}>
                  <p className="text-xs text-[#64748b] mb-2">Días de trabajo</p>
                  <div className="flex gap-1">
                    {['D', 'L', 'M', 'X', 'J', 'V', 'S'].map((d, i) => {
                      const s = (member.schedules as { day_of_week: number; is_working: boolean }[]).find(s => s.day_of_week === i)
                      return (
                        <span key={i} className={`w-7 h-7 rounded-lg text-xs flex items-center justify-center font-medium ${
                          s?.is_working ? 'bg-violet-600/20 text-violet-300' : 'bg-white/4 text-[#64748b]'
                        }`}>
                          {d}
                        </span>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
