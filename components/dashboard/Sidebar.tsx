'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import {
  LayoutDashboard, Calendar, Users, Scissors, Settings,
  LogOut, Zap, ExternalLink, Menu, X, ChevronRight,
} from 'lucide-react'
import type { Tenant } from '@/types/database'

const NAV = [
  { href: '/dashboard',              icon: LayoutDashboard, label: 'Inicio'      },
  { href: '/dashboard/appointments', icon: Calendar,        label: 'Citas'       },
  { href: '/dashboard/staff',        icon: Users,           label: 'Equipo'      },
  { href: '/dashboard/services',     icon: Scissors,        label: 'Servicios'   },
  { href: '/dashboard/settings',     icon: Settings,        label: 'Ajustes'     },
]

interface Props {
  tenant: Tenant
}

export default function Sidebar({ tenant }: Props) {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const Inner = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 py-5 flex items-center gap-2.5 border-b" style={{ borderColor: 'var(--app-border)' }}>
        <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center shrink-0">
          <Zap className="w-4 h-4 text-white" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-white truncate">{tenant.name}</p>
          <p className="text-xs text-[#64748b] capitalize">{tenant.plan}</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {NAV.map(item => {
          const active = item.href === '/dashboard'
            ? pathname === '/dashboard'
            : pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                active
                  ? 'bg-violet-600/15 text-violet-300'
                  : 'text-[#64748b] hover:text-[#94a3b8] hover:bg-white/4'
              )}
            >
              <item.icon className="w-4 h-4 shrink-0" />
              {item.label}
              {active && <ChevronRight className="w-3.5 h-3.5 ml-auto opacity-50" />}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t space-y-0.5" style={{ borderColor: 'var(--app-border)' }}>
        <Link
          href={`/b/${tenant.slug}`}
          target="_blank"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-[#64748b] hover:text-[#94a3b8] hover:bg-white/4 transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
          Ver página pública
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-[#64748b] hover:text-red-400 hover:bg-red-500/5 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Cerrar sesión
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-60 h-screen sticky top-0 shrink-0" style={{ background: 'var(--app-surface)', borderRight: '1px solid var(--app-border)' }}>
        <Inner />
      </aside>

      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 h-14" style={{ background: 'var(--app-surface)', borderBottom: '1px solid var(--app-border)' }}>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-violet-600 flex items-center justify-center">
            <Zap className="w-3.5 h-3.5 text-white" />
          </div>
          <p className="text-sm font-semibold text-white truncate max-w-[160px]">{tenant.name}</p>
        </div>
        <button onClick={() => setMobileOpen(o => !o)} className="p-1.5 text-[#64748b] hover:text-white">
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-30 flex" onClick={() => setMobileOpen(false)}>
          <div className="absolute inset-0 bg-black/50" />
          <aside className="relative w-60 h-full z-40" style={{ background: 'var(--app-surface)' }} onClick={e => e.stopPropagation()}>
            <Inner />
          </aside>
        </div>
      )}
    </>
  )
}
