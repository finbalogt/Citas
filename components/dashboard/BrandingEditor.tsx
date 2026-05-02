'use client'

import { useState, useRef, useEffect } from 'react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Tenant } from '@/types/database'
import { Eye } from 'lucide-react'
import Link from 'next/link'
import { HexColorPicker } from 'react-colorful'

interface Props { tenant: Tenant }

function ColorField({
  label, value, onChange,
}: { label: string; value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // Cierra solo si el click es FUERA del popover (no durante drag)
  useEffect(() => {
    if (!open) return
    function onPointerDown(e: PointerEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [open])

  return (
    <div className="flex items-center justify-between py-3 border-b" style={{ borderColor: 'var(--app-border)' }}>
      <label className="text-sm text-[#94a3b8]">{label}</label>
      <div className="flex items-center gap-3" ref={ref}>
        <div className="relative">
          <button
            type="button"
            onClick={() => setOpen(o => !o)}
            className="w-8 h-8 rounded-lg border-2 border-white/10 cursor-pointer transition-transform hover:scale-105"
            style={{ background: value }}
          />
          {open && (
            <div className="absolute right-0 top-10 z-50 rounded-xl overflow-hidden shadow-2xl"
              style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
              <HexColorPicker color={value} onChange={onChange} />
              <div className="px-3 py-2" style={{ background: '#1a1a28' }}>
                <input
                  type="text"
                  value={value}
                  onChange={e => {
                    const v = e.target.value
                    if (/^#[0-9A-Fa-f]{0,6}$/.test(v)) onChange(v)
                  }}
                  className="w-full text-xs font-mono text-center rounded px-2 py-1"
                  style={{ background: 'rgba(255,255,255,0.08)', color: '#f1f5f9', border: 'none', outline: 'none' }}
                  maxLength={7}
                />
              </div>
            </div>
          )}
        </div>
        <code className="text-xs text-[#64748b] font-mono w-16">{value}</code>
      </div>
    </div>
  )
}

export default function BrandingEditor({ tenant }: Props) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name:            tenant.name,
    welcome_message: tenant.welcome_message ?? '',
    primary_color:   tenant.primary_color,
    secondary_color: tenant.secondary_color,
    bg_color:        tenant.bg_color,
    text_color:      tenant.text_color,
    border_radius:   tenant.border_radius,
  })

  function update(k: string, v: string | number) {
    setForm(prev => ({ ...prev, [k]: v }))
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const supabase = createClient()
    const { error } = await supabase.from('tenants').update(form).eq('id', tenant.id)
    setSaving(false)
    if (error) { toast.error('Error al guardar'); return }
    toast.success('¡Cambios guardados!')
    router.refresh()
  }

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {/* Textos */}
      <div className="rounded-xl p-5" style={{ background: 'var(--app-surface)', border: '1px solid var(--app-border)' }}>
        <h2 className="text-sm font-semibold text-white mb-4">Textos</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-xs text-[#64748b] mb-1.5">Nombre del negocio</label>
            <input type="text" value={form.name} onChange={e => update('name', e.target.value)}
              className="input-dark" required />
          </div>
          <div>
            <label className="block text-xs text-[#64748b] mb-1.5">Mensaje de bienvenida</label>
            <textarea value={form.welcome_message} onChange={e => update('welcome_message', e.target.value)}
              rows={2} placeholder="Bienvenido, reserva tu cita en segundos..."
              className="input-dark resize-none" />
          </div>
        </div>
      </div>

      {/* Colores */}
      <div className="rounded-xl p-5" style={{ background: 'var(--app-surface)', border: '1px solid var(--app-border)' }}>
        <h2 className="text-sm font-semibold text-white mb-2">Colores</h2>
        <ColorField label="Color principal"  value={form.primary_color}   onChange={v => update('primary_color', v)} />
        <ColorField label="Color secundario" value={form.secondary_color} onChange={v => update('secondary_color', v)} />
        <ColorField label="Color de fondo"   value={form.bg_color}        onChange={v => update('bg_color', v)} />
        <ColorField label="Color de texto"   value={form.text_color}      onChange={v => update('text_color', v)} />
        <div className="flex items-center justify-between py-3">
          <label className="text-sm text-[#94a3b8]">Bordes</label>
          <div className="flex items-center gap-3">
            <input type="range" min={0} max={20} step={2}
              value={form.border_radius}
              onChange={e => update('border_radius', Number(e.target.value))}
              className="w-28 accent-violet-500"
            />
            <span className="text-xs text-[#64748b] w-8 text-right">{form.border_radius}px</span>
          </div>
        </div>
      </div>

      {/* Preview color real */}
      <div className="rounded-xl p-4 flex gap-3" style={{ background: form.primary_color }}>
        <div className="flex-1 text-white text-xs">
          <p className="font-semibold">{form.name || 'Vista previa'}</p>
          <p className="opacity-70 mt-0.5">{form.welcome_message || 'Así se ve el color principal'}</p>
        </div>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold text-white"
          style={{ background: form.secondary_color }}>
          ✓
        </div>
      </div>

      <div className="flex gap-3">
        <Link href={`/b/${tenant.slug}`} target="_blank"
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg border text-sm text-[#64748b] hover:text-white transition-colors flex-1 justify-center"
          style={{ borderColor: 'var(--app-border)' }}>
          <Eye className="w-4 h-4" />
          Ver página
        </Link>
        <button type="submit" disabled={saving}
          className="flex-1 py-2.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white font-medium text-sm transition-colors disabled:opacity-60">
          {saving ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </div>
    </form>
  )
}
