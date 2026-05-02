import { getTenantForCurrentUser } from '@/lib/tenant/resolver'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Palette, Globe, Clock, ChevronRight } from 'lucide-react'

export default async function SettingsPage() {
  const tenant = await getTenantForCurrentUser()
  if (!tenant) redirect('/login')

  const sections = [
    {
      href: '/dashboard/settings/branding',
      icon: Palette,
      title: 'Identidad visual',
      description: 'Logo, colores, nombre del negocio y mensaje de bienvenida',
    },
    {
      href: '/dashboard/settings/business',
      icon: Globe,
      title: 'Información del negocio',
      description: 'Dirección, teléfono, WhatsApp, redes sociales',
    },
    {
      href: '/dashboard/settings/policies',
      icon: Clock,
      title: 'Políticas de citas',
      description: 'Anticipación mínima, máxima, anticipo requerido, cancelaciones',
    },
  ]

  return (
    <div className="px-6 py-8 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Ajustes</h1>
        <p className="text-sm text-[#64748b] mt-0.5">Configura tu negocio</p>
      </div>

      <div className="space-y-2">
        {sections.map(s => (
          <Link
            key={s.href}
            href={s.href}
            className="flex items-center gap-4 p-5 rounded-xl hover:bg-white/3 transition-colors"
            style={{ background: 'var(--app-surface)', border: '1px solid var(--app-border)' }}
          >
            <div className="w-10 h-10 rounded-xl bg-violet-600/15 flex items-center justify-center shrink-0">
              <s.icon className="w-5 h-5 text-violet-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-white">{s.title}</p>
              <p className="text-xs text-[#64748b] mt-0.5">{s.description}</p>
            </div>
            <ChevronRight className="w-4 h-4 text-[#64748b]" />
          </Link>
        ))}
      </div>

      {/* Plan actual */}
      <div className="mt-6 p-5 rounded-xl" style={{ background: 'var(--app-surface)', border: '1px solid rgba(124,58,237,0.3)' }}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-white capitalize">Plan {tenant.plan}</p>
            <p className="text-xs text-[#64748b] mt-0.5">
              {tenant.plan === 'basic' && 'Hasta 3 profesionales · 1 sede'}
              {tenant.plan === 'pro' && 'Hasta 10 profesionales · 3 sedes'}
              {tenant.plan === 'elite' && 'Profesionales ilimitados · Sedes ilimitadas'}
            </p>
          </div>
          <span className="text-xs px-3 py-1 rounded-full bg-violet-600/20 text-violet-300 font-medium capitalize">
            {tenant.plan}
          </span>
        </div>
      </div>
    </div>
  )
}
