import { Calendar, Clock, User, Scissors, Phone, Loader2, Pencil } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { formatCurrency } from '@/lib/utils'
import type { Tenant } from '@/types/database'
import type { BookingData } from '../BookingWizard'

interface Props {
  tenant: Tenant
  booking: BookingData
  submitting: boolean
  onConfirm: () => void
  onEdit: (step: number) => void
}

export default function SummaryStep({ tenant, booking, submitting, onConfirm, onEdit }: Props) {
  const { service, staff, time, clientName, clientPhone, clientNotes } = booking
  if (!service || !time) return null

  const rows = [
    { icon: Scissors, label: 'Servicio',    value: service.name,                    step: 0 },
    { icon: User,     label: 'Profesional', value: staff?.name ?? 'Sin preferencia', step: 1 },
    { icon: Calendar, label: 'Fecha',       value: format(time, "EEEE d 'de' MMMM", { locale: es }), step: 2 },
    { icon: Clock,    label: 'Hora',        value: format(time, 'h:mm a'),           step: 2 },
    { icon: User,     label: 'Nombre',      value: clientName,                       step: 3 },
    { icon: Phone,    label: 'WhatsApp',    value: clientPhone,                      step: 3 },
  ]

  return (
    <div>
      <h2 className="text-xl font-bold mb-1">Confirma tu cita</h2>
      <p className="text-sm opacity-50 mb-6">Revisa los detalles antes de confirmar</p>

      <div className="rounded-2xl overflow-hidden mb-4" style={{ background: 'rgba(0,0,0,0.04)', borderRadius: 'var(--border-radius)' }}>
        {rows.map((row, i) => (
          <div key={i} className="flex items-center gap-3 px-4 py-3" style={{ borderBottom: i < rows.length - 1 ? '1px solid rgba(0,0,0,0.05)' : 'none' }}>
            <row.icon className="w-4 h-4 opacity-40 shrink-0" style={{ color: 'var(--color-text)' }} />
            <span className="text-xs opacity-50 w-24 shrink-0" style={{ color: 'var(--color-text)' }}>{row.label}</span>
            <span className="text-sm flex-1 font-medium" style={{ color: 'var(--color-text)' }}>{row.value}</span>
            <button onClick={() => onEdit(row.step)} className="p-1 rounded opacity-30 hover:opacity-70 transition-opacity">
              <Pencil className="w-3.5 h-3.5" style={{ color: 'var(--color-text)' }} />
            </button>
          </div>
        ))}
        {clientNotes && (
          <div className="px-4 py-3">
            <p className="text-xs opacity-40 mb-1" style={{ color: 'var(--color-text)' }}>Notas</p>
            <p className="text-sm opacity-70" style={{ color: 'var(--color-text)' }}>{clientNotes}</p>
          </div>
        )}
      </div>

      {/* Total */}
      <div className="flex items-center justify-between px-4 py-3 rounded-xl mb-6" style={{ background: 'rgba(0,0,0,0.04)', borderRadius: 'var(--border-radius)' }}>
        <span className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>Total del servicio</span>
        <span className="text-xl font-bold" style={{ color: 'var(--color-primary)' }}>{formatCurrency(service.price)}</span>
      </div>

      {tenant.cancel_hours > 0 && (
        <p className="text-xs opacity-40 text-center mb-4" style={{ color: 'var(--color-text)' }}>
          ⚠️ Cancelación gratuita hasta {tenant.cancel_hours} horas antes
        </p>
      )}

      <button
        onClick={onConfirm}
        disabled={submitting}
        className="w-full py-4 rounded-xl font-bold text-white text-base transition-opacity hover:opacity-90 disabled:opacity-60 flex items-center justify-center gap-2"
        style={{ background: 'var(--color-primary)', borderRadius: 'var(--border-radius)' }}
      >
        {submitting ? (
          <><Loader2 className="w-4 h-4 animate-spin" /> Confirmando...</>
        ) : (
          '✓ Confirmar cita'
        )}
      </button>
    </div>
  )
}
