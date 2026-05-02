import { getTenantForCurrentUser } from '@/lib/tenant/resolver'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import PoliciesEditor from '@/components/dashboard/PoliciesEditor'

export default async function PoliciesSettingsPage() {
  const tenant = await getTenantForCurrentUser()
  if (!tenant) redirect('/login')

  return (
    <div className="px-6 py-8 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/dashboard/settings" className="p-1.5 rounded-lg text-[#64748b] hover:text-white transition-colors hover:bg-white/5">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">Políticas de citas</h1>
          <p className="text-sm text-[#64748b] mt-0.5">Anticipación, cancelaciones, depósito e intervalos</p>
        </div>
      </div>
      <PoliciesEditor tenant={tenant} />
    </div>
  )
}
