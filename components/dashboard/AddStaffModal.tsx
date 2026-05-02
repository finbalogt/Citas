'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { X, Plus } from 'lucide-react'

interface Props {
  tenantId: string
}

export default function AddStaffModal({ tenantId }: Props) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name: '', specialty: '', bio: '', role: 'staff',
  })

  function update(k: string, v: string) {
    setForm(prev => ({ ...prev, [k]: v }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name) return
    setSaving(true)
    const supabase = createClient()

    const { data: member, error } = await supabase.from('staff').insert({
      tenant_id: tenantId,
      name:      form.name,
      specialty: form.specialty || null,
      bio:       form.bio || null,
      role:      form.role,
      is_active: true,
    }).select('id').single()

    if (error || !member) {
      toast.error('Error al guardar: ' + (error?.message ?? ''))
      setSaving(false)
      return
    }

    // Crear horario por defecto (Lun-Sab)
    const schedules = [1,2,3,4,5,6].map(day => ({
      tenant_id:   tenantId,
      staff_id:    member.id,
      day_of_week: day,
      start_time:  '08:00',
      end_time:    '18:00',
      is_working:  true,
      break_start: '13:00',
      break_end:   '14:00',
    }))
    // Domingo libre
    schedules.push({
      tenant_id:   tenantId,
      staff_id:    member.id,
      day_of_week: 0,
      start_time:  '08:00',
      end_time:    '18:00',
      is_working:  false,
      break_start: null as unknown as string,
      break_end:   null as unknown as string,
    })
    await supabase.from('schedules').insert(schedules)

    toast.success('Profesional agregado')
    setOpen(false)
    setForm({ name: '', specialty: '', bio: '', role: 'staff' })
    setSaving(false)
    router.refresh()
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium transition-colors"
      >
        <Plus className="w-4 h-4" />
        Agregar
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative w-full max-w-md rounded-2xl p-6 shadow-2xl z-10" style={{ background: '#12121f', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-semibold text-white">Nuevo profesional</h2>
              <button onClick={() => setOpen(false)} className="p-1 text-[#64748b] hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs text-[#64748b] mb-1.5">Nombre completo *</label>
                <input type="text" value={form.name} onChange={e => update('name', e.target.value)}
                  placeholder="Ej: Carlos Mendoza" required className="input-dark" />
              </div>

              <div>
                <label className="block text-xs text-[#64748b] mb-1.5">Rol</label>
                <select value={form.role} onChange={e => update('role', e.target.value)}
                  className="input-dark">
                  <option value="staff"   style={{ background: '#12121f' }}>Profesional</option>
                  <option value="manager" style={{ background: '#12121f' }}>Gerente</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-[#64748b] mb-1.5">Especialidad (opcional)</label>
                <input type="text" value={form.specialty} onChange={e => update('specialty', e.target.value)}
                  placeholder="Ej: Fades y degradados" className="input-dark" />
              </div>

              <div>
                <label className="block text-xs text-[#64748b] mb-1.5">Bio (opcional)</label>
                <textarea value={form.bio} onChange={e => update('bio', e.target.value)}
                  rows={2} placeholder="Breve descripción del profesional..."
                  className="input-dark resize-none" />
              </div>

              <p className="text-xs text-[#64748b]">
                ⏰ Se asigna horario por defecto Lun–Sab 8am–6pm. Puedes editarlo después.
              </p>

              <div className="flex gap-2 pt-1">
                <button type="button" onClick={() => setOpen(false)}
                  className="flex-1 py-2.5 rounded-lg text-sm text-[#64748b] hover:text-white transition-colors"
                  style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
                  Cancelar
                </button>
                <button type="submit" disabled={saving}
                  className="flex-1 py-2.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium transition-colors disabled:opacity-60">
                  {saving ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
