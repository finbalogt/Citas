import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { getTenantBySlug } from '@/lib/tenant/resolver'
import { createClient } from '@/lib/supabase/server'
import { formatCurrency } from '@/lib/utils'
import { Clock, MapPin, Phone, Instagram, Facebook, Calendar } from 'lucide-react'

interface Props {
  params: Promise<{ tenant: string }>
}

const DAY_NAMES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

export default async function TenantPublicPage({ params }: Props) {
  const { tenant: slug } = await params
  const tenant = await getTenantBySlug(slug)
  if (!tenant) notFound()

  const supabase = await createClient()

  const [{ data: services }, { data: staff }] = await Promise.all([
    supabase.from('services').select('*').eq('tenant_id', tenant.id).eq('is_active', true).order('sort_order'),
    supabase.from('staff').select('*').eq('tenant_id', tenant.id).eq('is_active', true).order('sort_order'),
  ])

  return (
    <div className="min-h-dvh" style={{ background: 'var(--color-bg)', color: 'var(--color-text)', fontFamily: 'var(--font-main)' }}>

      {/* Hero */}
      <div className="relative">
        {tenant.cover_url ? (
          <div className="h-56 md:h-72 relative overflow-hidden">
            <Image src={tenant.cover_url} alt={tenant.name} fill className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60" />
          </div>
        ) : (
          <div className="h-56 md:h-72 flex items-end" style={{ background: `linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%)` }}>
            <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml,...')]" />
          </div>
        )}

        {/* Info card */}
        <div className="max-w-2xl mx-auto px-4">
          <div className="-mt-12 relative z-10 rounded-2xl p-6 shadow-2xl" style={{ background: 'var(--color-bg)', borderRadius: 'var(--border-radius)' }}>
            <div className="flex items-start gap-4">
              {tenant.logo_url ? (
                <Image src={tenant.logo_url} alt={`Logo ${tenant.name}`} width={64} height={64} className="rounded-xl object-cover shrink-0" />
              ) : (
                <div className="w-16 h-16 rounded-xl flex items-center justify-center text-2xl font-bold text-white shrink-0"
                  style={{ background: `var(--color-primary)` }}>
                  {tenant.name[0]}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl font-bold truncate">{tenant.name}</h1>
                {tenant.address && (
                  <p className="text-sm opacity-60 flex items-center gap-1 mt-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {tenant.address}{tenant.city ? `, ${tenant.city}` : ''}
                  </p>
                )}
              </div>
            </div>

            {tenant.welcome_message && (
              <p className="mt-4 text-sm opacity-70 leading-relaxed">{tenant.welcome_message}</p>
            )}

            <Link
              href={`/b/${slug}/book`}
              className="mt-5 flex items-center justify-center gap-2 w-full py-3.5 font-semibold text-white rounded-xl transition-opacity hover:opacity-90"
              style={{ background: 'var(--color-primary)', borderRadius: 'var(--border-radius)' }}
            >
              <Calendar className="w-4 h-4" />
              Reservar cita
            </Link>

            {/* Contacto */}
            <div className="flex flex-wrap gap-3 mt-4 pt-4" style={{ borderTop: '1px solid rgba(0,0,0,0.08)' }}>
              {tenant.phone && (
                <a href={`tel:${tenant.phone}`} className="flex items-center gap-1.5 text-xs opacity-60 hover:opacity-100 transition-opacity">
                  <Phone className="w-3.5 h-3.5" />
                  {tenant.phone}
                </a>
              )}
              {tenant.instagram && (
                <a href={`https://instagram.com/${tenant.instagram}`} target="_blank" rel="noopener" className="flex items-center gap-1.5 text-xs opacity-60 hover:opacity-100 transition-opacity">
                  <Instagram className="w-3.5 h-3.5" />
                  @{tenant.instagram}
                </a>
              )}
              {tenant.facebook && (
                <a href={`https://facebook.com/${tenant.facebook}`} target="_blank" rel="noopener" className="flex items-center gap-1.5 text-xs opacity-60 hover:opacity-100 transition-opacity">
                  <Facebook className="w-3.5 h-3.5" />
                  Facebook
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-8">

        {/* Servicios */}
        {(services?.length ?? 0) > 0 && (
          <section>
            <h2 className="text-lg font-semibold mb-4">Nuestros servicios</h2>
            <div className="space-y-2">
              {services!.map(service => (
                <div key={service.id} className="flex items-center justify-between p-4 rounded-xl" style={{ background: 'rgba(0,0,0,0.04)', borderRadius: 'var(--border-radius)' }}>
                  <div>
                    <p className="font-medium text-sm">{service.name}</p>
                    {service.description && (
                      <p className="text-xs opacity-50 mt-0.5">{service.description}</p>
                    )}
                    <p className="text-xs opacity-50 flex items-center gap-1 mt-1">
                      <Clock className="w-3 h-3" />
                      {service.duration_min} min
                    </p>
                  </div>
                  <div className="text-right shrink-0 ml-4">
                    <p className="font-semibold text-sm">{formatCurrency(service.price)}</p>
                    <Link
                      href={`/b/${slug}/book?service=${service.id}`}
                      className="text-xs font-medium px-3 py-1 rounded-lg mt-1 inline-block text-white"
                      style={{ background: 'var(--color-secondary)', borderRadius: 'calc(var(--border-radius) / 1.5)' }}
                    >
                      Reservar
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Staff */}
        {(staff?.length ?? 0) > 0 && (
          <section>
            <h2 className="text-lg font-semibold mb-4">Nuestro equipo</h2>
            <div className="grid grid-cols-2 gap-3">
              {staff!.map(member => (
                <div key={member.id} className="p-4 rounded-xl text-center" style={{ background: 'rgba(0,0,0,0.04)', borderRadius: 'var(--border-radius)' }}>
                  {member.avatar_url ? (
                    <Image src={member.avatar_url} alt={member.name} width={56} height={56} className="rounded-full mx-auto object-cover" />
                  ) : (
                    <div className="w-14 h-14 rounded-full mx-auto flex items-center justify-center text-xl font-bold text-white"
                      style={{ background: 'var(--color-primary)' }}>
                      {member.name[0]}
                    </div>
                  )}
                  <p className="font-medium text-sm mt-2">{member.name}</p>
                  {member.specialty && <p className="text-xs opacity-50 mt-0.5">{member.specialty}</p>}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Footer */}
        <footer className="text-center text-xs opacity-30 pb-4">
          Powered by AgendaHub
        </footer>
      </div>
    </div>
  )
}
