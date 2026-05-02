import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { AppointmentStatus } from '@/types/database'

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await req.json()
  const { status, staff_notes, tenant_id } = body as {
    status?: AppointmentStatus
    staff_notes?: string
    tenant_id: string
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const updates: Record<string, unknown> = {}
  if (status)      updates.status = status
  if (staff_notes) updates.staff_notes = staff_notes
  if (status === 'cancelled') updates.cancelled_at = new Date().toISOString()

  const { data, error } = await supabase
    .from('appointments')
    .update(updates)
    .eq('id', id)
    .eq('tenant_id', tenant_id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
