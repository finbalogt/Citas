import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getTenantForCurrentUser } from '@/lib/tenant/resolver'

export async function PUT(req: Request) {
  try {
    const tenant = await getTenantForCurrentUser()
    if (!tenant) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const { staff_id, schedules } = await req.json()
    if (!staff_id || !Array.isArray(schedules)) {
      return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 })
    }

    const supabase = await createClient()

    // Verify staff belongs to this tenant
    const { data: staffMember } = await supabase
      .from('staff')
      .select('id')
      .eq('id', staff_id)
      .eq('tenant_id', tenant.id)
      .single()

    if (!staffMember) return NextResponse.json({ error: 'No autorizado' }, { status: 403 })

    // Upsert all 7 days
    const rows = schedules.map((s: {
      day_of_week: number
      is_working: boolean
      start_time: string
      end_time: string
      break_start: string | null
      break_end: string | null
    }) => ({
      tenant_id:   tenant.id,
      staff_id,
      day_of_week: s.day_of_week,
      is_working:  s.is_working,
      start_time:  s.start_time,
      end_time:    s.end_time,
      break_start: s.is_working ? (s.break_start || null) : null,
      break_end:   s.is_working ? (s.break_end || null) : null,
    }))

    const { error } = await supabase
      .from('schedules')
      .upsert(rows, { onConflict: 'staff_id,day_of_week' })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[PUT /api/staff/schedules]', err)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
