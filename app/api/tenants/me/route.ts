import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getTenantForCurrentUser } from '@/lib/tenant/resolver'

const ALLOWED_FIELDS = [
  'phone', 'whatsapp', 'address', 'city', 'country', 'timezone',
  'instagram', 'facebook', 'min_advance_hours', 'max_advance_days',
  'cancel_hours', 'deposit_percent', 'slot_interval_min',
]

export async function PATCH(req: Request) {
  try {
    const tenant = await getTenantForCurrentUser()
    if (!tenant) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const body = await req.json()
    const updates: Record<string, unknown> = {}
    for (const key of ALLOWED_FIELDS) {
      if (key in body) updates[key] = body[key]
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'Sin campos para actualizar' }, { status: 400 })
    }

    const supabase = await createClient()
    const { data, error } = await supabase
      .from('tenants')
      .update(updates)
      .eq('id', tenant.id)
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json(data)
  } catch (err) {
    console.error('[PATCH /api/tenants/me]', err)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
