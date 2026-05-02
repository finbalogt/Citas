import { createClient } from '@/lib/supabase/server'
import type { Tenant } from '@/types/database'

export async function getTenantBySlug(slug: string): Promise<Tenant | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('tenants')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (error || !data) return null
  return data as Tenant
}

export async function getTenantForCurrentUser(): Promise<Tenant | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from('tenants')
    .select('*')
    .eq('owner_id', user.id)
    .single()

  return data as Tenant | null
}
