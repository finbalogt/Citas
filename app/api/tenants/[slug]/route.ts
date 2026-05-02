import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('tenants')
    .select('id, name, slug, business_type, primary_color, secondary_color, bg_color, text_color, border_radius, logo_url, cover_url, welcome_message, address, city, phone, whatsapp')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (error || !data) {
    return NextResponse.json({ error: 'Negocio no encontrado' }, { status: 404 })
  }

  return NextResponse.json(data)
}
