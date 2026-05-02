import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getTenantForCurrentUser } from '@/lib/tenant/resolver'

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const tenant = await getTenantForCurrentUser()
    if (!tenant) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const { name, specialty, bio, role, is_active } = await req.json()
    if (!name) return NextResponse.json({ error: 'El nombre es requerido' }, { status: 400 })

    const supabase = await createClient()

    const { data, error } = await supabase
      .from('staff')
      .update({
        name,
        specialty: specialty || null,
        bio: bio || null,
        role,
        is_active,
      })
      .eq('id', id)
      .eq('tenant_id', tenant.id)
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    if (!data) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })

    return NextResponse.json(data)
  } catch (err) {
    console.error('[PATCH /api/staff/[id]]', err)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
