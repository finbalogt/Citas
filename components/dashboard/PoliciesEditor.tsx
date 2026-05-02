'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import type { Tenant } from '@/types/database'

interface Props { tenant: Tenant }

export default function PoliciesEditor({ tenant }: Props) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    min_advance_hours:  tenant.min_advance_hours,
    max_advance_days:   tenant.max_advance_days,
    cancel_hours:       tenant.cancel_hours,
    deposit_percent:    tenant.deposit_percent,
    slot_interval_min:  tenant.slot_interval_min,
  })

  function upd(k: keyof typeof form, v: number) {
    setForm(prev => ({ ...prev, [k]: v }))
  }

  async function handleSave() {
    setSaving(true)
    const res = await fetch('/api/tenants/me', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    if (res.ok) {
      toast.success('Políticas actualizadas')
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

  return (
    <div className="space-y-5">

      {/* Intervalos de tiempo */}
      <div className="rounded-xl p-5 space-y-4" style={{ background: 'var(--app-surface)', border: '1px solid var(--app-border)' }}>
        <div>
          <p className="text-sm font-semibold text-white">Intervalos de citas</p>
          <p className="text-xs text-[#64748b] mt-0.5">Cada cuánto tiempo se ofrecen slots de disponibilidad</p>
        </div>
        <div>
          <label className="block text-xs text-[#64748b] mb-1.5">Intervalo de slots</label>
          <select
            value={form.slot_interval_min}
            onChange={e => upd('slot_interval_min', Number(e.target.value))}
            style={{ ...inputStyle, cursor: 'pointer' }}
          >
            <option value={15} style={{ background: '#12121f' }}>Cada 15 minutos</option>
            <option value={30} style={{ background: '#12121f' }}>Cada 30 minutos</option>
            <option value={60} style={{ background: '#12121f' }}>Cada 1 hora</option>
          </select>
        </div>
      </div>

      {/* Anticipación */}
      <div className="rounded-xl p-5 space-y-4" style={{ background: 'var(--app-surface)', border: '1px solid var(--app-border)' }}>
        <div>
          <p className="text-sm font-semibold text-white">Anticipación de reservas</p>
          <p className="text-xs text-[#64748b] mt-0.5">Con cuánto tiempo de anticipación pueden reservar los clientes</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-[#64748b] mb-1.5">
              Mínimo de anticipación (horas)
            </label>
            <input
              type="number"
              min={0} max={72}
              value={form.min_advance_hours}
              onChange={e => upd('min_advance_hours', Number(e.target.value))}
              style={inputStyle}
            />
            <p className="text-xs text-[#64748b] mt-1">
              {form.min_advance_hours === 0
                ? 'Sin mínimo — pueden reservar al instante'
                : `Al menos ${form.min_advance_hours}h antes`}
            </p>
          </div>
          <div>
            <label className="block text-xs text-[#64748b] mb-1.5">
              Máximo de anticipación (días)
            </label>
            <input
              type="number"
              min={1} max={365}
              value={form.max_advance_days}
              onChange={e => upd('max_advance_days', Number(e.target.value))}
              style={inputStyle}
            />
            <p className="text-xs text-[#64748b] mt-1">
              Hasta {form.max_advance_days} día{form.max_advance_days !== 1 ? 's' : ''} hacia adelante
            </p>
          </div>
        </div>
      </div>

      {/* Cancelaciones */}
      <div className="rounded-xl p-5 space-y-4" style={{ background: 'var(--app-surface)', border: '1px solid var(--app-border)' }}>
        <div>
          <p className="text-sm font-semibold text-white">Cancelaciones</p>
          <p className="text-xs text-[#64748b] mt-0.5">Con cuánto tiempo de anticipación se puede cancelar</p>
        </div>
        <div>
          <label className="block text-xs text-[#64748b] mb-1.5">
            Cancelación permitida hasta (horas antes)
          </label>
          <input
            type="number"
            min={0} max={168}
            value={form.cancel_hours}
            onChange={e => upd('cancel_hours', Number(e.target.value))}
            style={inputStyle}
          />
          <p className="text-xs text-[#64748b] mt-1">
            {form.cancel_hours === 0
              ? 'Sin restricción de cancelación'
              : `El cliente puede cancelar hasta ${form.cancel_hours}h antes de la cita`}
          </p>
        </div>
      </div>

      {/* Depósito */}
      <div className="rounded-xl p-5 space-y-4" style={{ background: 'var(--app-surface)', border: '1px solid var(--app-border)' }}>
        <div>
          <p className="text-sm font-semibold text-white">Depósito</p>
          <p className="text-xs text-[#64748b] mt-0.5">Porcentaje del precio que se cobra como anticipo al reservar</p>
        </div>
        <div>
          <label className="block text-xs text-[#64748b] mb-1.5">
            Porcentaje de depósito (%)
          </label>
          <input
            type="number"
            min={0} max={100}
            value={form.deposit_percent}
            onChange={e => upd('deposit_percent', Number(e.target.value))}
            style={inputStyle}
          />
          <p className="text-xs text-[#64748b] mt-1">
            {form.deposit_percent === 0
              ? 'Sin depósito — reserva gratuita'
              : `Se cobra ${form.deposit_percent}% del precio al reservar`}
          </p>
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
