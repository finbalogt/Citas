'use client'

import { useState, useRef, useEffect } from 'react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { CheckCircle2, XCircle, UserX, MoreVertical } from 'lucide-react'
import type { AppointmentStatus } from '@/types/database'
import { createPortal } from 'react-dom'

interface Props {
  appointmentId: string
  status: AppointmentStatus
  tenantId: string
}

export default function AppointmentActions({ appointmentId, status, tenantId }: Props) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [pos, setPos] = useState({ top: 0, right: 0 })
  const btnRef = useRef<HTMLButtonElement>(null)

  function openMenu() {
    const rect = btnRef.current?.getBoundingClientRect()
    if (rect) {
      setPos({ top: rect.bottom + 4, right: window.innerWidth - rect.right })
    }
    setOpen(true)
  }

  // Cierra con Escape
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  async function updateStatus(newStatus: AppointmentStatus) {
    setLoading(true)
    setOpen(false)
    const res = await fetch(`/api/appointments/${appointmentId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus, tenant_id: tenantId }),
    })
    if (res.ok) {
      toast.success('Cita actualizada')
      router.refresh()
    } else {
      toast.error('Error al actualizar')
    }
    setLoading(false)
  }

  const actions = [
    { label: 'Marcar completada', icon: CheckCircle2, newStatus: 'completed' as AppointmentStatus, show: status === 'confirmed' || status === 'pending' },
    { label: 'No se presentó',    icon: UserX,        newStatus: 'no_show'   as AppointmentStatus, show: status === 'confirmed' },
    { label: 'Cancelar',          icon: XCircle,      newStatus: 'cancelled' as AppointmentStatus, show: status !== 'cancelled' && status !== 'completed' },
  ].filter(a => a.show)

  if (actions.length === 0) return <div />

  return (
    <>
      <button
        ref={btnRef}
        onClick={openMenu}
        disabled={loading}
        className="p-1.5 rounded-lg text-[#64748b] hover:text-white hover:bg-white/8 transition-colors disabled:opacity-40"
      >
        <MoreVertical className="w-4 h-4" />
      </button>

      {open && typeof document !== 'undefined' && createPortal(
        <>
          {/* Overlay invisible para cerrar */}
          <div className="fixed inset-0 z-[9998]" onClick={() => setOpen(false)} />

          {/* Dropdown fijo, siempre visible */}
          <div
            className="fixed z-[9999] w-48 rounded-xl py-1 shadow-2xl"
            style={{
              top:    pos.top,
              right:  pos.right,
              background: '#1e1e2e',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            {actions.map(a => (
              <button
                key={a.newStatus}
                onClick={() => updateStatus(a.newStatus)}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#94a3b8] hover:text-white hover:bg-white/5 transition-colors"
              >
                <a.icon className="w-3.5 h-3.5" />
                {a.label}
              </button>
            ))}
          </div>
        </>,
        document.body
      )}
    </>
  )
}
