'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { X, Pencil, Trash2, Plus, AlertTriangle } from 'lucide-react'
import type { Staff, Schedule, Service, BlockedTime } from '@/types/database'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'

const FULL_DAYS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']

interface StaffWithRelations extends Staff {
  schedules: Schedule[]
  staff_services: { service_id: string }[]
}

interface Props {
  staff: StaffWithRelations
  tenantId: string
  services: Pick<Service, 'id' | 'name'>[]
}

type DaySchedule = {
  day_of_week: number
  is_working: boolean
  start_time: string
  end_time: string
  break_start: string
  break_end: string
}

type Tab = 'info' | 'services' | 'schedule' | 'absences'

interface AffectedAppointment {
  id: string
  starts_at: string
  staff: { name: string } | null
  client: { name: string; phone: string | null } | null
}

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      style={{
        width: 40, height: 22, borderRadius: 11, border: 'none', cursor: 'pointer',
        background: on ? '#7c3aed' : 'rgba(255,255,255,0.1)',
        position: 'relative', transition: 'background 0.2s', flexShrink: 0,
      }}
    >
      <span style={{
        position: 'absolute', top: 3,
        left: on ? 21 : 3,
        width: 16, height: 16, borderRadius: '50%',
        background: 'white', transition: 'left 0.2s',
        boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
      }} />
    </button>
  )
}

export default function EditStaffModal({ staff, tenantId, services }: Props) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [tab, setTab] = useState<Tab>('info')

  const [absences, setAbsences] = useState<BlockedTime[]>([])
  const [absenceForm, setAbsenceForm] = useState({ start_date: '', end_date: '', reason: '' })
  const [savingAbsence, setSavingAbsence] = useState(false)
  const [affectedAppts, setAffectedAppts] = useState<AffectedAppointment[]>([])

  const loadAbsences = useCallback(async () => {
    const res = await fetch(`/api/blocked-times?staff_id=${staff.id}`)
    if (res.ok) setAbsences(await res.json())
  }, [staff.id])

  const [form, setForm] = useState({
    name: staff.name,
    specialty: staff.specialty ?? '',
    bio: staff.bio ?? '',
    role: staff.role as string,
    is_active: staff.is_active,
  })

  const [assignedServices, setAssignedServices] = useState<Set<string>>(
    () => new Set(staff.staff_services.map(ss => ss.service_id))
  )

  const [schedules, setSchedules] = useState<DaySchedule[]>(() =>
    [0, 1, 2, 3, 4, 5, 6].map(day => {
      const existing = staff.schedules.find(s => s.day_of_week === day)
      return {
        day_of_week: day,
        is_working: existing?.is_working ?? day !== 0,
        start_time: existing?.start_time ?? '08:00',
        end_time: existing?.end_time ?? '18:00',
        break_start: existing?.break_start ?? '13:00',
        break_end: existing?.break_end ?? '14:00',
      }
    })
  )

  function updateScheduleField(day: number, field: keyof DaySchedule, value: boolean | string) {
    setSchedules(prev => prev.map(s => s.day_of_week === day ? { ...s, [field]: value } : s))
  }

  function toggleService(serviceId: string) {
    setAssignedServices(prev => {
      const next = new Set(prev)
      next.has(serviceId) ? next.delete(serviceId) : next.add(serviceId)
      return next
    })
  }

  function handleOpen() {
    // Reset state to current staff values when reopening
    setForm({
      name: staff.name,
      specialty: staff.specialty ?? '',
      bio: staff.bio ?? '',
      role: staff.role as string,
      is_active: staff.is_active,
    })
    setAssignedServices(new Set(staff.staff_services.map(ss => ss.service_id)))
    setSchedules([0, 1, 2, 3, 4, 5, 6].map(day => {
      const existing = staff.schedules.find(s => s.day_of_week === day)
      return {
        day_of_week: day,
        is_working: existing?.is_working ?? day !== 0,
        start_time: existing?.start_time ?? '08:00',
        end_time: existing?.end_time ?? '18:00',
        break_start: existing?.break_start ?? '13:00',
        break_end: existing?.break_end ?? '14:00',
      }
    }))
    setTab('info')
    setAffectedAppts([])
    setAbsenceForm({ start_date: '', end_date: '', reason: '' })
    setOpen(true)
    loadAbsences()
  }

  async function handleAddAbsence() {
    if (!absenceForm.start_date) { toast.error('Selecciona una fecha de inicio'); return }
    if (!absenceForm.end_date) { toast.error('Selecciona una fecha de fin'); return }
    if (absenceForm.end_date < absenceForm.start_date) { toast.error('La fecha de fin no puede ser antes que la de inicio'); return }
    setSavingAbsence(true)
    try {
      const res = await fetch('/api/blocked-times', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          staff_id:   staff.id,
          start_date: absenceForm.start_date,
          end_date:   absenceForm.end_date,
          reason:     absenceForm.reason || null,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Error al guardar')
      toast.success('Ausencia registrada')
      setAbsenceForm({ start_date: '', end_date: '', reason: '' })
      if (data.affected?.length > 0) {
        setAffectedAppts(data.affected)
        toast.warning(`${data.affected.length} cita(s) en ese rango necesitan atención`)
      }
      loadAbsences()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Error al guardar')
    } finally {
      setSavingAbsence(false)
    }
  }

  async function handleDeleteAbsence(id: string) {
    const res = await fetch(`/api/blocked-times/${id}`, { method: 'DELETE' })
    if (res.ok) {
      toast.success('Ausencia eliminada')
      setAbsences(prev => prev.filter(a => a.id !== id))
    } else {
      toast.error('Error al eliminar')
    }
  }

  async function handleSave() {
    if (!form.name.trim()) { toast.error('El nombre es requerido'); return }
    setSaving(true)
    try {
      // 1. Actualizar info del profesional
      const staffRes = await fetch(`/api/staff/${staff.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          specialty: form.specialty.trim() || null,
          bio: form.bio.trim() || null,
          role: form.role,
          is_active: form.is_active,
        }),
      })
      if (!staffRes.ok) {
        const d = await staffRes.json()
        throw new Error(d.error ?? 'Error al actualizar profesional')
      }

      // 2. Actualizar horarios
      const schedulesRes = await fetch('/api/staff/schedules', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          staff_id: staff.id,
          schedules: schedules.map(s => ({
            ...s,
            break_start: s.is_working ? (s.break_start || null) : null,
            break_end: s.is_working ? (s.break_end || null) : null,
          })),
        }),
      })
      if (!schedulesRes.ok) {
        const d = await schedulesRes.json()
        throw new Error(d.error ?? 'Error al actualizar horarios')
      }

      // 3. Actualizar servicios asignados
      const supabase = createClient()
      await supabase.from('staff_services').delete().eq('staff_id', staff.id)
      if (assignedServices.size > 0) {
        const { error: svcError } = await supabase.from('staff_services').insert(
          Array.from(assignedServices).map(service_id => ({
            staff_id: staff.id,
            service_id,
          }))
        )
        if (svcError) throw new Error(svcError.message)
      }

      toast.success('Cambios guardados')
      setOpen(false)
      router.refresh()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  const inputStyle = "w-full px-3 py-2 rounded-lg text-sm text-white outline-none focus:ring-1 focus:ring-violet-500"
  const inputBg = { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }

  return (
    <>
      <button
        onClick={handleOpen}
        className="p-1.5 rounded-lg transition-colors text-[#64748b] hover:text-white hover:bg-white/8"
        title="Editar profesional"
      >
        <Pencil className="w-4 h-4" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div
            className="relative w-full max-w-lg rounded-2xl shadow-2xl z-10 flex flex-col"
            style={{ background: '#12121f', border: '1px solid rgba(255,255,255,0.08)', maxHeight: '90vh' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-5 pb-4 shrink-0"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <div>
                <h2 className="text-base font-semibold text-white">Editar profesional</h2>
                <p className="text-xs text-[#64748b] mt-0.5">{staff.name}</p>
              </div>
              <button onClick={() => setOpen(false)} className="p-1 text-[#64748b] hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 px-6 pt-3 shrink-0 flex-wrap">
              {(['info', 'services', 'schedule', 'absences'] as Tab[]).map(t => (
                <button
                  key={t}
                  onClick={() => { setTab(t); if (t === 'absences') loadAbsences() }}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                  style={{
                    background: tab === t ? 'rgba(124,58,237,0.2)' : 'transparent',
                    color: tab === t ? '#c4b5fd' : '#64748b',
                  }}
                >
                  {t === 'info' ? 'Información' : t === 'services' ? 'Servicios' : t === 'schedule' ? 'Horario' : 'Ausencias'}
                </button>
              ))}
            </div>

            {/* Contenido con scroll */}
            <div className="overflow-y-auto flex-1 px-6 py-4">

              {/* TAB: INFO */}
              {tab === 'info' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs text-[#64748b] mb-1.5">Nombre completo *</label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                      className={inputStyle}
                      style={inputBg}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[#64748b] mb-1.5">Rol</label>
                    <select
                      value={form.role}
                      onChange={e => setForm(p => ({ ...p, role: e.target.value }))}
                      className={inputStyle}
                      style={{ ...inputBg, cursor: 'pointer' }}
                    >
                      <option value="staff" style={{ background: '#12121f' }}>Profesional</option>
                      <option value="manager" style={{ background: '#12121f' }}>Gerente</option>
                      <option value="owner" style={{ background: '#12121f' }}>Dueño</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-[#64748b] mb-1.5">Especialidad</label>
                    <input
                      type="text"
                      value={form.specialty}
                      onChange={e => setForm(p => ({ ...p, specialty: e.target.value }))}
                      placeholder="Ej: Fades y degradados"
                      className={inputStyle}
                      style={inputBg}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[#64748b] mb-1.5">Bio</label>
                    <textarea
                      value={form.bio}
                      onChange={e => setForm(p => ({ ...p, bio: e.target.value }))}
                      rows={3}
                      placeholder="Breve descripción del profesional..."
                      className={inputStyle + ' resize-none'}
                      style={inputBg}
                    />
                  </div>
                  <div className="flex items-center justify-between py-3"
                    style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    <div>
                      <p className="text-sm text-white">Estado activo</p>
                      <p className="text-xs text-[#64748b] mt-0.5">
                        Aparece en el flujo de reservas cuando está activo
                      </p>
                    </div>
                    <Toggle on={form.is_active} onToggle={() => setForm(p => ({ ...p, is_active: !p.is_active }))} />
                  </div>
                </div>
              )}

              {/* TAB: SERVICIOS */}
              {tab === 'services' && (
                <div>
                  <p className="text-xs text-[#64748b] mb-4">
                    Selecciona los servicios que puede atender este profesional.
                    Solo aparecerá en el formulario de reserva para los servicios asignados.
                  </p>
                  {services.length === 0 ? (
                    <p className="text-sm text-[#64748b] text-center py-8">
                      No hay servicios creados. Crea servicios primero desde la sección Servicios.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {services.map(service => {
                        const checked = assignedServices.has(service.id)
                        return (
                          <button
                            key={service.id}
                            onClick={() => toggleService(service.id)}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors"
                            style={{
                              background: checked ? 'rgba(124,58,237,0.12)' : 'rgba(255,255,255,0.03)',
                              border: `1px solid ${checked ? 'rgba(124,58,237,0.4)' : 'rgba(255,255,255,0.06)'}`,
                            }}
                          >
                            <div
                              className="w-4 h-4 rounded flex items-center justify-center shrink-0"
                              style={{
                                background: checked ? '#7c3aed' : 'transparent',
                                border: checked ? 'none' : '1px solid rgba(255,255,255,0.2)',
                              }}
                            >
                              {checked && (
                                <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 12 12">
                                  <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                              )}
                            </div>
                            <span className="text-sm text-white">{service.name}</span>
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* TAB: HORARIO */}
              {tab === 'schedule' && (
                <div className="space-y-2">
                  <p className="text-xs text-[#64748b] mb-3">
                    Activa los días que trabaja y configura sus horarios de entrada, salida y descanso.
                  </p>
                  {schedules.map(day => (
                    <div
                      key={day.day_of_week}
                      className="rounded-xl p-3"
                      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-sm font-medium ${day.is_working ? 'text-white' : 'text-[#64748b]'}`}>
                          {FULL_DAYS[day.day_of_week]}
                        </span>
                        <Toggle
                          on={day.is_working}
                          onToggle={() => updateScheduleField(day.day_of_week, 'is_working', !day.is_working)}
                        />
                      </div>
                      {day.is_working && (
                        <div className="grid grid-cols-2 gap-2 mt-3">
                          <div>
                            <label className="text-xs text-[#64748b] block mb-1">Entrada</label>
                            <input
                              type="time"
                              value={day.start_time}
                              onChange={e => updateScheduleField(day.day_of_week, 'start_time', e.target.value)}
                              className={inputStyle + ' text-xs'}
                              style={inputBg}
                            />
                          </div>
                          <div>
                            <label className="text-xs text-[#64748b] block mb-1">Salida</label>
                            <input
                              type="time"
                              value={day.end_time}
                              onChange={e => updateScheduleField(day.day_of_week, 'end_time', e.target.value)}
                              className={inputStyle + ' text-xs'}
                              style={inputBg}
                            />
                          </div>
                          <div>
                            <label className="text-xs text-[#64748b] block mb-1">Inicio descanso</label>
                            <input
                              type="time"
                              value={day.break_start}
                              onChange={e => updateScheduleField(day.day_of_week, 'break_start', e.target.value)}
                              className={inputStyle + ' text-xs'}
                              style={inputBg}
                            />
                          </div>
                          <div>
                            <label className="text-xs text-[#64748b] block mb-1">Fin descanso</label>
                            <input
                              type="time"
                              value={day.break_end}
                              onChange={e => updateScheduleField(day.day_of_week, 'break_end', e.target.value)}
                              className={inputStyle + ' text-xs'}
                              style={inputBg}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
              {/* TAB: AUSENCIAS */}
              {tab === 'absences' && (
                <div className="space-y-5">
                  {/* Alerta de citas afectadas */}
                  {affectedAppts.length > 0 && (
                    <div className="rounded-xl p-4" style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)' }}>
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="w-4 h-4 text-yellow-400 shrink-0" />
                        <p className="text-sm font-medium text-yellow-300">
                          {affectedAppts.length} cita(s) en el rango bloqueado
                        </p>
                      </div>
                      <p className="text-xs text-yellow-400/70 mb-3">
                        Estas citas necesitan ser reagendadas o canceladas manualmente:
                      </p>
                      <div className="space-y-1.5">
                        {affectedAppts.map(a => (
                          <div key={a.id} className="flex items-center justify-between text-xs text-yellow-200">
                            <span>{a.client?.name ?? 'Sin nombre'}</span>
                            <span className="text-yellow-400/70">
                              {format(parseISO(a.starts_at), "d MMM · HH:mm", { locale: es })}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Formulario de nueva ausencia */}
                  <div className="rounded-xl p-4 space-y-3"
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <p className="text-sm font-medium text-white">Nueva ausencia</p>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs text-[#64748b] block mb-1">Desde</label>
                        <input
                          type="date"
                          value={absenceForm.start_date}
                          onChange={e => setAbsenceForm(p => ({ ...p, start_date: e.target.value, end_date: p.end_date || e.target.value }))}
                          className="w-full px-3 py-2 rounded-lg text-sm text-white outline-none"
                          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                        />
                      </div>
                      <div>
                        <label className="text-xs text-[#64748b] block mb-1">Hasta</label>
                        <input
                          type="date"
                          value={absenceForm.end_date}
                          min={absenceForm.start_date}
                          onChange={e => setAbsenceForm(p => ({ ...p, end_date: e.target.value }))}
                          className="w-full px-3 py-2 rounded-lg text-sm text-white outline-none"
                          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-[#64748b] block mb-1">Motivo (opcional)</label>
                      <input
                        type="text"
                        value={absenceForm.reason}
                        onChange={e => setAbsenceForm(p => ({ ...p, reason: e.target.value }))}
                        placeholder="Ej: Vacaciones, médico, feriado..."
                        className="w-full px-3 py-2 rounded-lg text-sm text-white outline-none"
                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                      />
                    </div>
                    <button
                      onClick={handleAddAbsence}
                      disabled={savingAbsence}
                      className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-60"
                      style={{ background: 'rgba(124,58,237,0.2)', color: '#c4b5fd', border: '1px solid rgba(124,58,237,0.3)' }}
                    >
                      <Plus className="w-4 h-4" />
                      {savingAbsence ? 'Guardando...' : 'Agregar ausencia'}
                    </button>
                  </div>

                  {/* Lista de ausencias existentes */}
                  {absences.length === 0 ? (
                    <p className="text-sm text-[#64748b] text-center py-4">Sin ausencias registradas</p>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-xs text-[#64748b] uppercase tracking-wide">Ausencias registradas</p>
                      {absences.map(a => (
                        <div key={a.id}
                          className="flex items-center justify-between px-4 py-3 rounded-xl"
                          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                          <div>
                            <p className="text-sm text-white">
                              {format(parseISO(a.start_at), "d MMM", { locale: es })}
                              {a.start_at.slice(0, 10) !== a.end_at.slice(0, 10) && (
                                <> — {format(parseISO(a.end_at), "d MMM", { locale: es })}</>
                              )}
                            </p>
                            {a.reason && <p className="text-xs text-[#64748b] mt-0.5">{a.reason}</p>}
                          </div>
                          <button
                            onClick={() => handleDeleteAbsence(a.id)}
                            className="p-1.5 rounded-lg text-[#64748b] hover:text-red-400 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 flex gap-2 shrink-0"
              style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex-1 py-2.5 rounded-lg text-sm text-[#64748b] hover:text-white transition-colors"
                style={{ border: '1px solid rgba(255,255,255,0.08)' }}
              >
                {tab === 'absences' ? 'Cerrar' : 'Cancelar'}
              </button>
              {tab !== 'absences' && (
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 py-2.5 rounded-lg text-white text-sm font-medium transition-colors disabled:opacity-60"
                  style={{ background: saving ? '#5b21b6' : '#7c3aed' }}
                >
                  {saving ? 'Guardando...' : 'Guardar cambios'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
