'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import type { Tenant } from '@/types/database'

interface Props { tenant: Tenant }

const TIMEZONES = [
  { value: 'America/Guatemala', label: 'Guatemala (GMT-6)' },
  { value: 'America/Mexico_City', label: 'México Ciudad (GMT-6)' },
  { value: 'America/Monterrey', label: 'México Monterrey (GMT-6)' },
  { value: 'America/Bogota', label: 'Colombia (GMT-5)' },
  { value: 'America/Lima', label: 'Perú (GMT-5)' },
  { value: 'America/Caracas', label: 'Venezuela (GMT-4)' },
  { value: 'America/Santiago', label: 'Chile (GMT-3/-4)' },
  { value: 'America/Argentina/Buenos_Aires', label: 'Argentina (GMT-3)' },
  { value: 'America/Sao_Paulo', label: 'Brasil São Paulo (GMT-3)' },
  { value: 'America/Costa_Rica', label: 'Costa Rica (GMT-6)' },
  { value: 'America/El_Salvador', label: 'El Salvador (GMT-6)' },
  { value: 'America/Honduras', label: 'Honduras (GMT-6)' },
  { value: 'America/Managua', label: 'Nicaragua (GMT-6)' },
  { value: 'America/Panama', label: 'Panamá (GMT-5)' },
  { value: 'America/Santo_Domingo', label: 'Rep. Dominicana (GMT-4)' },
]

export default function BusinessEditor({ tenant }: Props) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    phone:     tenant.phone ?? '',
    whatsapp:  tenant.whatsapp ?? '',
    address:   tenant.address ?? '',
    city:      tenant.city ?? '',
    country:   tenant.country,
    timezone:  tenant.timezone,
    instagram: tenant.instagram ?? '',
    facebook:  tenant.facebook ?? '',
  })

  function upd(k: keyof typeof form, v: string) {
    setForm(prev => ({ ...prev, [k]: v }))
  }

  async function handleSave() {
    setSaving(true)
    const res = await fetch('/api/tenants/me', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phone:     form.phone || null,
        whatsapp:  form.whatsapp || null,
        address:   form.address || null,
        city:      form.city || null,
        country:   form.country,
        timezone:  form.timezone,
        instagram: form.instagram || null,
        facebook:  form.facebook || null,
      }),
    })
    if (res.ok) {
      toast.success('Información actualizada')
      router.refresh()
    } else {
      const d = await res.json()
      toast.error(d.error ?? 'Error al guardar')
    }
    setSaving(false)
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '8px 12px', borderRadius: 8,
    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
    color: 'white', fontSize: 14, outline: 'none',
  }

  function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
      <div>
        <label className="block text-xs text-[#64748b] mb-1.5">{label}</label>
        {children}
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* Contacto */}
      <div className="rounded-xl p-5 space-y-4" style={{ background: 'var(--app-surface)', border: '1px solid var(--app-border)' }}>
        <p className="text-sm font-semibold text-white">Contacto</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Teléfono">
            <input type="tel" value={form.phone} onChange={e => upd('phone', e.target.value)}
              placeholder="+502 1234 5678" style={inputStyle} />
          </Field>
          <Field label="WhatsApp">
            <input type="tel" value={form.whatsapp} onChange={e => upd('whatsapp', e.target.value)}
              placeholder="+502 1234 5678" style={inputStyle} />
          </Field>
        </div>
      </div>

      {/* Ubicación */}
      <div className="rounded-xl p-5 space-y-4" style={{ background: 'var(--app-surface)', border: '1px solid var(--app-border)' }}>
        <p className="text-sm font-semibold text-white">Ubicación</p>
        <Field label="Dirección">
          <input type="text" value={form.address} onChange={e => upd('address', e.target.value)}
            placeholder="Ej: 6a Avenida 12-34, Zona 1" style={inputStyle} />
        </Field>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Ciudad">
            <input type="text" value={form.city} onChange={e => upd('city', e.target.value)}
              placeholder="Guatemala City" style={inputStyle} />
          </Field>
          <Field label="País">
            <input type="text" value={form.country} onChange={e => upd('country', e.target.value)}
              placeholder="Guatemala" style={inputStyle} />
          </Field>
        </div>
        <Field label="Zona horaria">
          <select value={form.timezone} onChange={e => upd('timezone', e.target.value)}
            style={{ ...inputStyle, cursor: 'pointer' }}>
            {TIMEZONES.map(tz => (
              <option key={tz.value} value={tz.value} style={{ background: '#12121f' }}>
                {tz.label}
              </option>
            ))}
          </select>
        </Field>
      </div>

      {/* Redes sociales */}
      <div className="rounded-xl p-5 space-y-4" style={{ background: 'var(--app-surface)', border: '1px solid var(--app-border)' }}>
        <p className="text-sm font-semibold text-white">Redes sociales</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Instagram (usuario)">
            <div className="flex items-center" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8 }}>
              <span className="px-3 text-sm text-[#64748b]">@</span>
              <input type="text" value={form.instagram} onChange={e => upd('instagram', e.target.value)}
                placeholder="minegocio" style={{ ...inputStyle, background: 'transparent', border: 'none', paddingLeft: 0 }} />
            </div>
          </Field>
          <Field label="Facebook (usuario o URL)">
            <input type="text" value={form.facebook} onChange={e => upd('facebook', e.target.value)}
              placeholder="minegocio" style={inputStyle} />
          </Field>
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full py-2.5 rounded-xl text-white text-sm font-medium transition-colors disabled:opacity-60"
        style={{ background: saving ? '#5b21b6' : '#7c3aed' }}
      >
        {saving ? 'Guardando...' : 'Guardar cambios'}
      </button>
    </div>
  )
}
