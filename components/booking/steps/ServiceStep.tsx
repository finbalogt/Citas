import { Clock } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import type { Service } from '@/types/database'

interface Props {
  services: Service[]
  selected: Service | null
  onSelect: (service: Service) => void
}

export default function ServiceStep({ services, selected, onSelect }: Props) {
  return (
    <div>
      <h2 className="text-xl font-bold mb-1">¿Qué servicio necesitas?</h2>
      <p className="text-sm opacity-50 mb-6">Selecciona un servicio para continuar</p>

      <div className="space-y-2">
        {services.map(service => (
          <button
            key={service.id}
            onClick={() => onSelect(service)}
            className="w-full flex items-center justify-between p-4 rounded-xl text-left transition-all"
            style={{
              background: selected?.id === service.id ? 'rgba(0,0,0,0.06)' : 'rgba(0,0,0,0.03)',
              border: `2px solid ${selected?.id === service.id ? 'var(--color-primary)' : 'transparent'}`,
              borderRadius: 'var(--border-radius)',
              color: 'var(--color-text)',
            }}
          >
            <div>
              <p className="font-semibold text-sm">{service.name}</p>
              {service.description && (
                <p className="text-xs opacity-50 mt-0.5">{service.description}</p>
              )}
              <p className="text-xs opacity-50 flex items-center gap-1 mt-1">
                <Clock className="w-3 h-3" />
                {service.duration_min} min
              </p>
            </div>
            <div className="text-right shrink-0 ml-4">
              <p className="font-bold text-base">{formatCurrency(service.price)}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
