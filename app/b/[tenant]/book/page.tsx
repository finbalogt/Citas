import { notFound } from 'next/navigation'
import { getTenantBySlug } from '@/lib/tenant/resolver'
import { createClient } from '@/lib/supabase/server'
import BookingWizard from '@/components/booking/BookingWizard'

interface Props {
  params: Promise<{ tenant: string }>
  searchParams: Promise<{ service?: string }>
}

export default async function BookPage({ params, searchParams }: Props) {
  const { tenant: slug } = await params
  const { service: preselectedServiceId } = await searchParams

  const tenant = await getTenantBySlug(slug)
  if (!tenant) notFound()

  const supabase = await createClient()

  const [{ data: services }, { data: staff }] = await Promise.all([
    supabase.from('services').select('*').eq('tenant_id', tenant.id).eq('is_active', true).order('sort_order'),
    supabase.from('staff').select('*, staff_services(service_id)').eq('tenant_id', tenant.id).eq('is_active', true).order('sort_order'),
  ])

  return (
    <BookingWizard
      tenant={tenant}
      services={services ?? []}
      staff={staff ?? []}
      preselectedServiceId={preselectedServiceId}
    />
  )
}
