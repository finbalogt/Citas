import { getTenantForCurrentUser } from '@/lib/tenant/resolver'
import { redirect } from 'next/navigation'
import BrandingEditor from '@/components/dashboard/BrandingEditor'

export default async function BrandingPage() {
  const tenant = await getTenantForCurrentUser()
  if (!tenant) redirect('/login')

  return (
    <div className="px-6 py-8 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Identidad visual</h1>
        <p className="text-sm text-[#64748b] mt-0.5">Personaliza cómo ven tu negocio los clientes</p>
      </div>
      <BrandingEditor tenant={tenant} />
    </div>
  )
}
