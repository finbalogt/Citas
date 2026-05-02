import Link from 'next/link'
import { APP_CONFIG } from '@/lib/utils'
import { Zap, Calendar, Users, Palette, Bell, BarChart2, Shield, ChevronRight, Check } from 'lucide-react'

const FEATURES = [
  { icon: Calendar,  title: 'Reservas en línea 24/7',    desc: 'Tus clientes reservan desde su celular en 60 segundos, cualquier hora.' },
  { icon: Palette,   title: 'Tu marca, tus colores',     desc: 'Logo, colores y dominio propios. Tus clientes no saben que usas nuestra plataforma.' },
  { icon: Bell,      title: 'WhatsApp automático',        desc: 'Confirmaciones y recordatorios automáticos. Cero no-shows.' },
  { icon: Users,     title: 'Múltiples profesionales',   desc: 'Cada uno con su horario, disponibilidad y agenda independiente.' },
  { icon: BarChart2, title: 'Panel de control',          desc: 'Ve tus citas, ingresos esperados y equipo desde un solo lugar.' },
  { icon: Shield,    title: 'Seguridad total',           desc: 'Datos de cada negocio completamente aislados. Estándar bancario.' },
]

const PLANS = [
  {
    name: 'Básico',
    price: 'Q150',
    period: '/mes',
    description: 'Para negocios pequeños',
    features: ['1 sede', 'Hasta 3 profesionales', 'Reservas ilimitadas', 'WhatsApp automático', 'Subdominio gratis'],
    cta: 'Empezar gratis',
    highlighted: false,
  },
  {
    name: 'Pro',
    price: 'Q300',
    period: '/mes',
    description: 'El más popular',
    features: ['Todo lo de Básico', 'Hasta 10 profesionales', 'Dominio propio', 'Reportes y estadísticas', 'CRM de clientes', 'Hasta 3 sucursales'],
    cta: 'Empezar gratis',
    highlighted: true,
  },
  {
    name: 'Elite',
    price: 'Q600',
    period: '/mes',
    description: 'Para negocios grandes',
    features: ['Todo lo de Pro', 'Profesionales ilimitados', 'Sucursales ilimitadas', 'White-label total', 'Soporte prioritario', 'API pública'],
    cta: 'Contactar',
    highlighted: false,
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-dvh bg-[#080810] text-white">

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 h-16" style={{ background: 'rgba(8,8,16,0.8)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-violet-600 flex items-center justify-center">
            <Zap className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-semibold text-white">{APP_CONFIG.name}</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm text-[#94a3b8] hover:text-white transition-colors px-3 py-1.5">
            Iniciar sesión
          </Link>
          <Link href="/register" className="text-sm font-medium px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 transition-colors">
            Registrar negocio
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6 text-center relative overflow-hidden">
        {/* Glow background */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[600px] h-[600px] rounded-full opacity-20" style={{ background: 'radial-gradient(circle, #7c3aed 0%, transparent 70%)' }} />
        </div>

        <div className="relative max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-6" style={{ background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)', color: '#a78bfa' }}>
            <Zap className="w-3 h-3" />
            Sistema de reservas online para LATAM
          </div>

          <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
            Reservas online para tu{' '}
            <span className="gradient-text">negocio de servicios</span>
          </h1>

          <p className="text-lg md:text-xl text-[#64748b] max-w-2xl mx-auto mb-10 leading-relaxed">
            Barberías, salones de belleza, spas y más. Tus clientes reservan en 60 segundos,
            tú reduces los no-shows y organizas tu agenda automáticamente.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/register"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-base transition-colors">
              Empieza gratis 14 días
              <ChevronRight className="w-4 h-4" />
            </Link>
            <Link href="/b/demo-barberia"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl text-[#94a3b8] hover:text-white font-medium text-base transition-colors"
              style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
              Ver demo
            </Link>
          </div>

          <p className="text-xs text-[#64748b] mt-4">Sin tarjeta de crédito · Sin contrato</p>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-3">Todo lo que necesitas</h2>
          <p className="text-[#64748b]">Una plataforma completa para gestionar tu negocio</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map(f => (
            <div key={f.title} className="p-6 rounded-xl" style={{ background: 'var(--app-surface)', border: '1px solid var(--app-border)' }}>
              <div className="w-10 h-10 rounded-xl bg-violet-600/15 flex items-center justify-center mb-4">
                <f.icon className="w-5 h-5 text-violet-400" />
              </div>
              <h3 className="font-semibold mb-2 text-white">{f.title}</h3>
              <p className="text-sm text-[#64748b] leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">Precios simples</h2>
            <p className="text-[#64748b]">Sin sorpresas. Cancela cuando quieras.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PLANS.map(plan => (
              <div
                key={plan.name}
                className={`rounded-2xl p-6 flex flex-col ${plan.highlighted ? 'ring-2 ring-violet-500' : ''}`}
                style={{
                  background: plan.highlighted ? 'rgba(124,58,237,0.08)' : 'var(--app-surface)',
                  border: plan.highlighted ? 'none' : '1px solid var(--app-border)',
                }}
              >
                {plan.highlighted && (
                  <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-violet-600 text-white w-fit mb-3">
                    Más popular
                  </span>
                )}
                <h3 className="font-bold text-lg text-white">{plan.name}</h3>
                <p className="text-xs text-[#64748b] mb-4">{plan.description}</p>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-bold text-white">{plan.price}</span>
                  <span className="text-sm text-[#64748b]">{plan.period}</span>
                </div>
                <ul className="space-y-2.5 flex-1 mb-6">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-center gap-2 text-sm text-[#94a3b8]">
                      <Check className="w-4 h-4 text-violet-400 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/register"
                  className={`w-full py-2.5 rounded-xl font-medium text-sm text-center transition-colors ${
                    plan.highlighted
                      ? 'bg-violet-600 hover:bg-violet-500 text-white'
                      : 'border border-white/10 hover:border-white/20 text-white hover:bg-white/4'
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 px-6 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">Listo en 5 minutos</h2>
          <p className="text-[#64748b] mb-8">Registra tu negocio, configura tus servicios y comparte tu enlace. Así de simple.</p>
          <Link href="/register"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-lg transition-colors">
            <Zap className="w-5 h-5" />
            Crear mi cuenta gratis
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 text-center text-xs text-[#64748b] border-t" style={{ borderColor: 'var(--app-border)' }}>
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-5 h-5 rounded bg-violet-600 flex items-center justify-center">
            <Zap className="w-2.5 h-2.5 text-white" />
          </div>
          <span className="text-white font-medium text-sm">{APP_CONFIG.name}</span>
        </div>
        <p>© {new Date().getFullYear()} {APP_CONFIG.name}. Guatemala → LATAM</p>
      </footer>
    </div>
  )
}
