import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { addMinutes, parseISO } from 'date-fns'
import { sendWhatsAppText } from '@/lib/whatsapp/client'
import { buildConfirmationMsg } from '@/lib/whatsapp/templates'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const tenantId = searchParams.get('tenant_id')

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const query = supabase
    .from('appointments')
    .select('*, staff(*), service:services(*), client:clients(*)')
    .order('starts_at', { ascending: false })

  if (tenantId) query.eq('tenant_id', tenantId)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const {
      tenant_id, staff_id, service_id, starts_at,
      price_total, client_name, client_phone, client_notes, source,
    } = body

    if (!tenant_id || !service_id || !starts_at || !client_name || !client_phone) {
      return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 })
    }

    const supabase = await createClient()

    // Obtener duración del servicio
    const { data: service } = await supabase
      .from('services')
      .select('duration_min, name')
      .eq('id', service_id)
      .single()

    if (!service) return NextResponse.json({ error: 'Servicio no encontrado' }, { status: 404 })

    const startsAt = parseISO(starts_at)
    const endsAt   = addMinutes(startsAt, service.duration_min)

    // Buscar o crear cliente
    let clientId: string | null = null
    const { data: existingClient } = await supabase
      .from('clients')
      .select('id')
      .eq('tenant_id', tenant_id)
      .eq('phone', client_phone)
      .single()

    if (existingClient) {
      clientId = existingClient.id
    } else {
      const { data: newClient } = await supabase
        .from('clients')
        .insert({ tenant_id, name: client_name, phone: client_phone })
        .select('id')
        .single()
      clientId = newClient?.id ?? null
    }

    // Resolver staff_id si "sin preferencia"
    let resolvedStaffId = staff_id
    if (!resolvedStaffId) {
      const { data: firstStaff } = await supabase
        .from('staff')
        .select('id')
        .eq('tenant_id', tenant_id)
        .eq('is_active', true)
        .order('sort_order')
        .limit(1)
        .single()
      resolvedStaffId = firstStaff?.id
    }
    if (!resolvedStaffId) return NextResponse.json({ error: 'No hay profesionales disponibles' }, { status: 400 })

    // Crear cita
    const { data: appointment, error } = await supabase
      .from('appointments')
      .insert({
        tenant_id,
        staff_id:      resolvedStaffId,
        service_id,
        client_id:     clientId,
        starts_at:     startsAt.toISOString(),
        ends_at:       endsAt.toISOString(),
        status:        'confirmed',
        price_total,
        deposit_amount: 0,
        client_notes,
        source:         source ?? 'online',
      })
      .select()
      .single()

    if (error || !appointment) {
      return NextResponse.json({ error: error?.message ?? 'Error al crear cita' }, { status: 500 })
    }

    // Enviar WhatsApp de confirmación (async, no bloquea la respuesta)
    sendWhatsAppConfirmation(supabase, appointment.id, tenant_id, service.name, client_phone, startsAt).catch(console.error)

    return NextResponse.json({ id: appointment.id }, { status: 201 })
  } catch (err) {
    console.error('[POST /api/appointments]', err)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

async function sendWhatsAppConfirmation(
  supabase: Awaited<ReturnType<typeof createClient>>,
  appointmentId: string,
  tenantId: string,
  serviceName: string,
  phone: string,
  startsAt: Date
) {
  const { data: tenant } = await supabase
    .from('tenants')
    .select('name, address, whatsapp')
    .eq('id', tenantId)
    .single()

  const { data: appt } = await supabase
    .from('appointments')
    .select('staff(*)')
    .eq('id', appointmentId)
    .single()

  if (!tenant) return

  const staffName = (appt?.staff as { name: string } | null)?.name ?? 'nuestro equipo'
  const msg = buildConfirmationMsg({
    businessName: tenant.name,
    serviceName,
    staffName,
    startsAt,
    address: tenant.address ?? undefined,
  })

  const sent = await sendWhatsAppText({ to: phone, message: msg })

  await supabase.from('notifications').insert({
    appointment_id: appointmentId,
    tenant_id:      tenantId,
    type:           'confirmation',
    channel:        'whatsapp',
    status:         sent ? 'sent' : 'failed',
    sent_at:        sent ? new Date().toISOString() : null,
  })
}
