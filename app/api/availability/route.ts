import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getAvailableSlots } from '@/lib/availability/calculator'
import { parseISO, startOfDay, endOfDay } from 'date-fns'
import { toZonedTime } from 'date-fns-tz'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const tenantId  = searchParams.get('tenant_id')
  const serviceId = searchParams.get('service_id')
  const dateStr   = searchParams.get('date')        // yyyy-MM-dd
  const staffId   = searchParams.get('staff_id')    // opcional

  if (!tenantId || !serviceId || !dateStr) {
    return NextResponse.json({ error: 'Faltan parámetros' }, { status: 400 })
  }

  const supabase = await createClient()

  // Obtener datos del tenant
  const { data: tenant } = await supabase
    .from('tenants')
    .select('timezone, min_advance_hours, max_advance_days, slot_interval_min')
    .eq('id', tenantId)
    .single()

  if (!tenant) return NextResponse.json({ slots: [] })

  // Obtener servicio
  const { data: service } = await supabase
    .from('services')
    .select('duration_min')
    .eq('id', serviceId)
    .single()

  if (!service) return NextResponse.json({ slots: [] })

  const date = parseISO(dateStr)
  const dayOfWeek = date.getDay()

  // Si hay preferencia de staff, buscar solo ese. Si no, buscar todos y fusionar slots
  let staffIds: string[] = []
  if (staffId) {
    staffIds = [staffId]
  } else {
    const { data: allStaff } = await supabase
      .from('staff')
      .select('id')
      .eq('tenant_id', tenantId)
      .eq('is_active', true)
    staffIds = allStaff?.map(s => s.id) ?? []
  }

  // Bloqueos de todo el negocio (staff_id IS NULL) — afectan a todos los profesionales
  const { data: businessBlocks } = await supabase
    .from('blocked_times')
    .select('start_at, end_at')
    .eq('tenant_id', tenantId)
    .is('staff_id', null)
    .lte('start_at', endOfDay(date).toISOString())
    .gte('end_at', startOfDay(date).toISOString())

  const allSlotSets: Set<number>[] = []

  for (const sid of staffIds) {
    // Horario del día
    const { data: schedule } = await supabase
      .from('schedules')
      .select('*')
      .eq('staff_id', sid)
      .eq('day_of_week', dayOfWeek)
      .single()

    if (!schedule || !schedule.is_working) continue

    // Citas del día
    const { data: appointments } = await supabase
      .from('appointments')
      .select('starts_at, ends_at, status')
      .eq('staff_id', sid)
      .gte('starts_at', startOfDay(date).toISOString())
      .lte('starts_at', endOfDay(date).toISOString())
      .neq('status', 'cancelled')

    // Bloqueos personales del profesional + bloqueos de negocio
    const { data: staffBlocks } = await supabase
      .from('blocked_times')
      .select('start_at, end_at')
      .eq('staff_id', sid)
      .lte('start_at', endOfDay(date).toISOString())
      .gte('end_at', startOfDay(date).toISOString())

    const combinedBlocks = [...(staffBlocks ?? []), ...(businessBlocks ?? [])]

    const slots = getAvailableSlots({
      schedule,
      appointments: appointments ?? [],
      blockedTimes: combinedBlocks,
      serviceDuration:  service.duration_min,
      date,
      minAdvanceHours:  tenant.min_advance_hours,
      slotInterval:     tenant.slot_interval_min,
    })

    const slotSet = new Set(slots.map(s => s.getTime()))
    allSlotSets.push(slotSet)
  }

  // Unión de todos los slots disponibles (cualquier barbero disponible sirve)
  const merged = new Set<number>()
  allSlotSets.forEach(set => set.forEach(t => merged.add(t)))

  const sortedSlots = Array.from(merged)
    .sort((a, b) => a - b)
    .map(t => new Date(t).toISOString())

  return NextResponse.json({ slots: sortedSlots })
}
