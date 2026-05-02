'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { X, Plus } from 'lucide-react'

const CATEGORIES = [
  { value: 'haircut',   label: 'Corte de cabello' },
  { value: 'beard',     label: 'Barba' },
  { value: 'color',     label: 'Color / tinte' },
  { value: 'nails',     label: 'Uñas' },
  { value: 'wax',       label: 'Depilación' },
  { value: 'treatment', label: 'Tratamiento' },
  { value: 'makeup',    label: 'Maquillaje' },
  { value: 'massage',   label: 'Masaje' },
  { value: 'general',   label: 'Otro' },
]

interface Props {
  tenantId: string
}

export default function AddServiceModal({ tenantId }: Props) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name: '', description: '', category: 'general',
    duration_min: 30, price: '',
  })

  function update(k: string, v: string | number) {
    setForm(prev => ({ ...prev, [k]: v }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name || !form.price) return
    setSaving(true)
    const supabase = createClient()
    const { error } = await supabase.from('services').insert({
      tenant_id:    tenantId,
      name:         form.name,
      description:  form.description || null,
      category:     form.category,
      duration_min: Number(form.duration_min),
      price:        Number(form.price),
      is_active:    true,
    })
    setSaving(false)
    if (error) { toast.error('Error al guardar: ' + error.message); return }
    toast.success('Servicio agregado')
    setOpen(false)
    setForm({ name: '', description: '', category: 'general', duration_min: 30, price: '' })
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
              <h2 className="text-base font-semibold text-white">Nuevo servicio</h2>
              <button onClick={() => setOpen(false)} className="p-1 text-[#64748b] hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs text-[#64748b] mb-1.5">Nombre del servicio *</label>
                <input type="text" value={form.name} onChange={e => update('name', e.target.value)}
                  placeholder="Ej: Corte clásico" required className="input-dark" />
              </div>

              <div>
                <label className="block text-xs text-[#64748b] mb-1.5">Categoría</label>
                <select value={form.category} onChange={e => update('category', e.target.value)}
                  className="input-dark">
                  {CATEGORIES.map(c => (
                    <option key={c.value} value={c.value} style={{ background: '#12121f' }}>{c.label}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-[#64748b] mb-1.5">Duración (minutos) *</label>
                  <input type="number" value={form.duration_min} onChange={e => update('duration_min', e.target.value)}
                    min={5} step={5} required className="input-dark" />
                </div>
                <div>
                  <label className="block text-xs text-[#64748b] mb-1.5">Precio (Q) *</label>
                  <input type="number" value={form.price} onChange={e => update('price', e.target.value)}
                    min={0} step={0.5} placeholder="50.00" required className="input-dark" />
                </div>
              </div>

              <div>
                <label className="block text-xs text-[#64748b] mb-1.5">Descripción (opcional)</label>
                <textarea value={form.description} onChange={e => update('description', e.target.value)}
                  rows={2} placeholder="Breve descripción del servicio..."
                  className="input-dark resize-none" />
              </div>

              <div className="flex gap-2 pt-1">
                <button type="button" onClick={() => setOpen(false)}
                  className="flex-1 py-2.5 rounded-lg text-sm text-[#64748b] hover:text-white transition-colors"
                  style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
                  Cancelar
                </button>
                <button type="submit" disabled={saving}
                  className="flex-1 py-2.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium transition-colors disabled:opacity-60">
                  {saving ? 'Guardando...' : 'Guardar servicio'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
