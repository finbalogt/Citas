import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getTenantForCurrentUser } from '@/lib/tenant/resolver'

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const tenant = await getTenantForCurrentUser()
    if (!tenant) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const supabase = await createClient()
    const { error } = await supabase
      .from('blocked_times')
      .delete()
      .eq('id', id)
      .eq('tenant_id', tenant.id)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[DELETE /api/blocked-times/[id]]', err)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
