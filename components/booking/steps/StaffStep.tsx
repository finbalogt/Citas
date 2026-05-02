import Image from 'next/image'
import type { Staff } from '@/types/database'

interface Props {
  staff: Staff[]
  selected: Staff | null
  onSelect: (staff: Staff | null) => void
}

export default function StaffStep({ staff, selected, onSelect }: Props) {
  return (
    <div>
      <h2 className="text-xl font-bold mb-1">¿Con quién quieres tu cita?</h2>
      <p className="text-sm opacity-50 mb-6">Puedes dejar que nosotros elijamos</p>

      <div className="space-y-2">
        {/* Sin preferencia */}
        <button
          onClick={() => onSelect(null)}
          className="w-full flex items-center gap-4 p-4 rounded-xl text-left transition-all"
          style={{
            background: selected === null ? 'rgba(0,0,0,0.06)' : 'rgba(0,0,0,0.03)',
            border: `2px solid ${selected === null ? 'var(--color-primary)' : 'transparent'}`,
            borderRadius: 'var(--border-radius)',
            color: 'var(--color-text)',
          }}
        >
          <div className="w-12 h-12 rounded-full flex items-center justify-center text-xl" style={{ background: 'rgba(0,0,0,0.08)' }}>
            ✨
          </div>
          <div>
            <p className="font-semibold text-sm">Sin preferencia</p>
            <p className="text-xs opacity-50 mt-0.5">El profesional disponible te atenderá</p>
          </div>
        </button>

        {staff.map(member => (
          <button
            key={member.id}
            onClick={() => onSelect(member)}
            className="w-full flex items-center gap-4 p-4 rounded-xl text-left transition-all"
            style={{
              background: selected?.id === member.id ? 'rgba(0,0,0,0.06)' : 'rgba(0,0,0,0.03)',
              border: `2px solid ${selected?.id === member.id ? 'var(--color-primary)' : 'transparent'}`,
              borderRadius: 'var(--border-radius)',
              color: 'var(--color-text)',
            }}
          >
            {member.avatar_url ? (
              <Image src={member.avatar_url} alt={member.name} width={48} height={48} className="rounded-full object-cover shrink-0" />
            ) : (
              <div className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold text-white shrink-0"
                style={{ background: 'var(--color-primary)' }}>
                {member.name[0]}
              </div>
            )}
            <div>
              <p className="font-semibold text-sm">{member.name}</p>
              {member.specialty && <p className="text-xs opacity-50 mt-0.5">{member.specialty}</p>}
              {member.bio && <p className="text-xs opacity-40 mt-0.5 line-clamp-1">{member.bio}</p>}
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
