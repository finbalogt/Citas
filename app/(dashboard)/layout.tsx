import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getTenantForCurrentUser } from '@/lib/tenant/resolver'
import Sidebar from '@/components/dashboard/Sidebar'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const tenant = await getTenantForCurrentUser()
  if (!tenant) redirect('/register')

  return (
    <div className="flex min-h-dvh" style={{ background: 'var(--app-bg)' }}>
      <Sidebar tenant={tenant} />
      <main className="flex-1 min-w-0 lg:pt-0 pt-14">
        {children}
      </main>
    </div>
  )
}
