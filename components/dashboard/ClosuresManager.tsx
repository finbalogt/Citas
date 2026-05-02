'use client'

import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { Trash2, Plus, AlertTriangle, Building2 } from 'lucide-react'
import type { BlockedTime } from '@/types/database'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'

interface AffectedAppointment {
  id: string
  starts_at: string
  staff: { name: string } | null
  client: { name: string; phone: string | null } | null
}

export default function ClosuresManager() {
  const [closures, setClosures] = useState<BlockedTime[]>([])
  const [form, setForm] = useState({ start_date: '', end_date: '', reason: '' })
  const [saving, setSaving] = useState(false)
  const [affected, setAffected] = useState<AffectedAppointment[]>([])

  const load = useCallback(async () => {
    const res = await fetch('/api/blocked-times?staff_id=business')
    if (res.ok) setClosures(await res.json())
  }, [])

  useEffect(() => { load() }, [load])

  async function handleAdd() {
    if (!form.start_date) { toast.error('Selecciona una fecha de inicio'); return }
    if (!form.end_date) { toast.error('Selecciona una fecha de fin'); return }
    if (form.end_date < form.start_date) { toast.error('La fecha de fin no puede ser antes que la de inicio'); return }
    setSaving(true)
    try {
      const res = await fetch('/api/blocked-times', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          staff_id:   null,
          start_date: form.start_date,
          end_date:   form.end_date,
          reason:     form.reason || null,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Error al guardar')
      toast.success('Cierre registrado')
      setForm({ start_date: '', end_date: '', reason: '' })
      if (data.affected?.length > 0) {
        setAffected(data.affected)
        toast.warning(`${data.affected.length} cita(s) en ese rango necesitan atención`)
      }
      load()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    const res = await fetch(`/api/blocked-times/${id}`, { method: 'DELETE' })
    if (res.ok) {
      toast.success('Cierre eliminado')
      setClosures(prev => prev.filter(c => c.id !== id))
    } else {
      toast.error('Error al eliminar')
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '8px 12px', borderRadius: 8,
    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
    color: 'white', fontSize: 14, outline: 'none',
  }

  return (
    <div className="space-y-5">

      {/* Alerta de citas afectadas */}
      {affected.length > 0 && (
        <div className="rounded-xl p-4" style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)' }}>
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-yellow-400 shrink-0" />
            <p className="text-sm font-medium text-yellow-300">
              {affected.length} cita(s) en el rango bloqueado
            </p>
          </div>
          <p className="text-xs text-yellow-400/70 mb-3">
            Estas citas necesitan ser reagendadas o canceladas manualmente:
          </p>
          <div className="space-y-2">
            {affected.map(a => (
              <div key={a.id} className="flex items-center justify-between text-xs text-yellow-200">
                <span>
                  {a.client?.name ?? 'Sin nombre'}
                  {a.staff && <span className="text-yellow-400/60"> · {a.staff.name}</span>}
                </span>
                <span className="text-yellow-400/70">
                  {format(parseISO(a.starts_at), "d MMM · HH:mm", { locale: es })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Formulario nuevo cierre */}
      <div className="rounded-xl p-5 space-y-4"
        style={{ background: 'var(--app-surface)', border: '1px solid var(--app-border)' }}>
        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4 text-violet-400" />
          <p className="text-sm font-semibold text-white">Nuevo cierre del negocio</p>
        </div>
        <p className="text-xs text-[#64748b]">
          Bloquea días para todo el equipo. Ningún cliente podrá reservar en esas fechas.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-[#64748b] mb-1.5">Desde</label>
            <input
              type="date"
              value={form.start_date}
              onChange={e => setForm(p => ({ ...p, start_date: e.target.value, end_date: p.end_date || e.target.value }))}
              style={inputStyle}
            />
          </div>
          <div>
            <label className="block text-xs text-[#64748b] mb-1.5">Hasta</label>
            <input
              type="date"
              value={form.end_date}
              min={form.start_date}
              onChange={e => setForm(p => ({ ...p, end_date: e.target.value }))}
              style={inputStyle}
            />
          </div>
        </div>
        <div>
          <label className="block text-xs text-[#64748b] mb-1.5">Motivo (opcional)</label>
          <input
            type="text"
            value={form.reason}
            onChange={e => setForm(p => ({ ...p, reason: e.target.value }))}
            placeholder="Ej: Semana Santa, Navidad, remodelación..."
            style={inputStyle}
          />
        </div>
        <button
          onClick={handleAdd}
          disabled={saving}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-white text-sm font-medium transition-colors disabled:opacity-60"
          style={{ background: saving ? '#5b21b6' : '#7c3aed' }}
        >
          <Plus className="w-4 h-4" />
          {saving ? 'Guardando...' : 'Registrar cierre'}
        </button>
      </div>

      {/* Lista de cierres existentes */}
      <div>
        <p className="text-xs text-[#64748b] uppercase tracking-wide mb-3">Cierres registrados</p>
        {closures.length === 0 ? (
          <div className="rounded-xl px-5 py-10 text-center"
            style={{ background: 'var(--app-surface)', border: '1px solid var(--app-border)' }}>
            <Building2 className="w-7 h-7 text-[#1a1a28] mx-auto mb-2" />
            <p className="text-sm text-[#64748b]">Sin cierres registrados</p>
          </div>
        ) : (
          <div className="space-y-2">
            {closures.map(c => (
              <div key={c.id}
                className="flex items-center justify-between px-5 py-4 rounded-xl"
                style={{ background: 'var(--app-surface)', border: '1px solid var(--app-border)' }}>
                <div>
                  <p className="text-sm font-medium text-white">
                    {format(parseISO(c.start_at), "d 'de' MMMM", { locale: es })}
                    {c.start_at.slice(0, 10) !== c.end_at.slice(0, 10) && (
                      <> — {format(parseISO(c.end_at), "d 'de' MMMM", { locale: es })}</>
                    )}
                  </p>
                  {c.reason && (
                    <p className="text-xs text-[#64748b] mt-0.5">{c.reason}</p>
                  )}
                </div>
                <button
                  onClick={() => handleDelete(c.id)}
                  className="p-2 rounded-lg text-[#64748b] hover:text-red-400 hover:bg-red-500/8 transition-colors"
                  title="Eliminar cierre"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
