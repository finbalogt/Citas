import { Phone, User, MessageSquare } from 'lucide-react'
import type { BookingData } from '../BookingWizard'

interface Props {
  name: string
  phone: string
  notes: string
  onChange: (partial: Partial<BookingData>) => void
  onNext: () => void
}

export default function ClientInfoStep({ name, phone, notes, onChange, onNext }: Props) {
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onNext()
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-1">Tus datos</h2>
      <p className="text-sm opacity-50 mb-6">Para enviarte el recordatorio por WhatsApp</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="flex items-center gap-1.5 text-xs font-medium opacity-60 mb-1.5" style={{ color: 'var(--color-text)' }}>
            <User className="w-3.5 h-3.5" />
            Nombre completo
          </label>
          <input
            type="text"
            value={name}
            onChange={e => onChange({ clientName: e.target.value })}
            placeholder="Tu nombre"
            required
            className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
            style={{
              background: 'rgba(0,0,0,0.05)',
              border: '2px solid transparent',
              color: 'var(--color-text)',
              borderRadius: 'var(--border-radius)',
            }}
            onFocus={e => e.currentTarget.style.borderColor = 'var(--color-primary)'}
            onBlur={e => e.currentTarget.style.borderColor = 'transparent'}
          />
        </div>

        <div>
          <label className="flex items-center gap-1.5 text-xs font-medium opacity-60 mb-1.5" style={{ color: 'var(--color-text)' }}>
            <Phone className="w-3.5 h-3.5" />
            WhatsApp
          </label>
          <input
            type="tel"
            value={phone}
            onChange={e => onChange({ clientPhone: e.target.value })}
            placeholder="+502 5555-1234"
            required
            className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
            style={{
              background: 'rgba(0,0,0,0.05)',
              border: '2px solid transparent',
              color: 'var(--color-text)',
              borderRadius: 'var(--border-radius)',
            }}
            onFocus={e => e.currentTarget.style.borderColor = 'var(--color-primary)'}
            onBlur={e => e.currentTarget.style.borderColor = 'transparent'}
          />
          <p className="text-xs opacity-40 mt-1" style={{ color: 'var(--color-text)' }}>
            Solo para enviarte recordatorios y confirmación
          </p>
        </div>

        <div>
          <label className="flex items-center gap-1.5 text-xs font-medium opacity-60 mb-1.5" style={{ color: 'var(--color-text)' }}>
            <MessageSquare className="w-3.5 h-3.5" />
            Notas adicionales (opcional)
          </label>
          <textarea
            value={notes}
            onChange={e => onChange({ clientNotes: e.target.value })}
            placeholder="Ej: sin nada en las orejas, tinte específico..."
            rows={3}
            className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none transition-all"
            style={{
              background: 'rgba(0,0,0,0.05)',
              border: '2px solid transparent',
              color: 'var(--color-text)',
              borderRadius: 'var(--border-radius)',
            }}
            onFocus={e => e.currentTarget.style.borderColor = 'var(--color-primary)'}
            onBlur={e => e.currentTarget.style.borderColor = 'transparent'}
          />
        </div>

        <button
          type="submit"
          className="w-full py-3.5 rounded-xl font-semibold text-sm text-white transition-opacity hover:opacity-90 mt-2"
          style={{ background: 'var(--color-primary)', borderRadius: 'var(--border-radius)' }}
        >
          Continuar →
        </button>
      </form>
    </div>
  )
}
