import { NextResponse } from 'next/server'

// Webhook de verificación Meta
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const mode      = searchParams.get('hub.mode')
  const token     = searchParams.get('hub.verify_token')
  const challenge = searchParams.get('hub.challenge')

  if (mode === 'subscribe' && token === process.env.META_WEBHOOK_VERIFY_TOKEN) {
    return new Response(challenge, { status: 200 })
  }
  return new Response('Forbidden', { status: 403 })
}

// Recibir mensajes entrantes (ej: cliente responde CANCELAR)
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const entry = body.entry?.[0]?.changes?.[0]?.value
    const messages = entry?.messages

    if (!messages?.length) {
      return NextResponse.json({ ok: true })
    }

    for (const msg of messages) {
      if (msg.type === 'text') {
        const text = msg.text.body.trim().toUpperCase()
        const from = msg.from

        if (text === 'CANCELAR') {
          // TODO: buscar cita activa del número y cancelarla
          console.log(`[WhatsApp] ${from} quiere cancelar`)
        }
      }
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[WhatsApp Webhook]', err)
    return NextResponse.json({ ok: true }) // siempre 200 a Meta
  }
}
