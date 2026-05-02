import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { slug, name, business_type, owner_email, owner_password, owner_name } = body

    if (!slug || !name || !owner_email || !owner_password) {
      return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 })
    }

    const supabase = await createServiceClient()

    // Verificar que el slug no existe
    const { data: existing } = await supabase.from('tenants').select('id').eq('slug', slug).single()
    if (existing) {
      return NextResponse.json({ error: 'Ese nombre de negocio ya existe, elige otro' }, { status: 409 })
    }

    // Crear usuario en Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: owner_email,
      password: owner_password,
      email_confirm: true,
      user_metadata: { full_name: owner_name },
    })

    if (authError || !authData.user) {
      return NextResponse.json({ error: authError?.message ?? 'Error al crear usuario' }, { status: 400 })
    }

    // Crear tenant
    const { data: tenant, error: tenantError } = await supabase
      .from('tenants')
      .insert({ slug, name, business_type: business_type ?? 'general', owner_id: authData.user.id })
      .select()
      .single()

    if (tenantError || !tenant) {
      // Limpiar usuario creado
      await supabase.auth.admin.deleteUser(authData.user.id)
      return NextResponse.json({ error: tenantError?.message ?? 'Error al crear negocio' }, { status: 500 })
    }

    // Crear perfil de staff para el owner
    const { data: ownerStaff } = await supabase.from('staff').insert({
      tenant_id: tenant.id,
      user_id:   authData.user.id,
      name:      owner_name,
      role:      'owner',
    }).select('id').single()

    // Crear horarios por defecto: Lun-Sab 8am-7pm con descanso 1pm-2pm
    if (ownerStaff) {
      const schedules = [0,1,2,3,4,5,6].map(day => ({
        tenant_id:   tenant.id,
        staff_id:    ownerStaff.id,
        day_of_week: day,
        start_time:  '08:00',
        end_time:    '19:00',
        is_working:  day !== 0,          // domingo libre
        break_start: day !== 0 ? '13:00' : null,
        break_end:   day !== 0 ? '14:00' : null,
      }))
      await supabase.from('schedules').insert(schedules)
    }

    // Hacer sign in para devolver sesión
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: owner_email,
      password: owner_password,
    })

    if (signInError) {
      return NextResponse.json({ error: 'Negocio creado. Inicia sesión manualmente.' }, { status: 201 })
    }

    return NextResponse.json({ id: tenant.id, slug: tenant.slug }, { status: 201 })
  } catch (err) {
    console.error('[POST /api/tenants]', err)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
