import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getTenantForCurrentUser } from '@/lib/tenant/resolver'
import { startOfDay, endOfDay, parseISO } from 'date-fns'

export async function GET(req: Request) {
  try {
    const tenant = await getTenantForCurrentUser()
    if (!tenant) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const staffId = searchParams.get('staff_id') // null string = business-wide

    const supabase = await createClient()
    let query = supabase
      .from('blocked_times')
      .select('*')
      .eq('tenant_id', tenant.id)
      .gte('end_at', new Date().toISOString())
      .order('start_at')

    if (staffId === 'business') {
      query = query.is('staff_id', null)
    } else if (staffId) {
      query = query.eq('staff_id', staffId)
    }

    const { data, error } = await query
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json(data ?? [])
  } catch (err) {
    console.error('[GET /api/blocked-times]', err)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const tenant = await getTenantForCurrentUser()
    if (!tenant) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const { staff_id, start_date, end_date, reason } = await req.json()
    if (!start_date || !end_date) {
      return NextResponse.json({ error: 'Fechas requeridas' }, { status: 400 })
    }

    // Si es por persona, verificar que pertenece a este tenant
    if (staff_id) {
      const supabaseCheck = await createClient()
      const { data: member } = await supabaseCheck
        .from('staff')
        .select('id')
        .eq('id', staff_id)
        .eq('tenant_id', tenant.id)
        .single()
      if (!member) return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    }

    const start_at = startOfDay(parseISO(start_date)).toISOString()
    const end_at   = endOfDay(parseISO(end_date)).toISOString()

    const supabase = await createClient()

    // Crear el bloqueo
    const { data: blocked, error } = await supabase
      .from('blocked_times')
      .insert({
        tenant_id: tenant.id,
        staff_id:  staff_id || null,
        start_at,
        end_at,
        reason:    reason || null,
      })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // Buscar citas afectadas en ese rango
    let apptQuery = supabase
      .from('appointments')
      .select('id, starts_at, ends_at, status, staff:staff(name), client:clients(name, phone)')
      .eq('tenant_id', tenant.id)
      .in('status', ['pending', 'confirmed'])
      .gte('starts_at', start_at)
      .lte('starts_at', end_at)

    if (staff_id) {
      apptQuery = apptQuery.eq('staff_id', staff_id)
    }

    const { data: affected } = await apptQuery

    return NextResponse.json({ blocked, affected: affected ?? [] }, { status: 201 })
  } catch (err) {
    console.error('[POST /api/blocked-times]', err)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
