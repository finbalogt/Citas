const GRAPH_URL = 'https://graph.facebook.com/v20.0'

interface SendTextParams {
  to: string     // número E.164, ej: +50255551234
  message: string
}

export async function sendWhatsAppText({ to, message }: SendTextParams): Promise<boolean> {
  const token         = process.env.META_WHATSAPP_TOKEN
  const phoneNumberId = process.env.META_PHONE_NUMBER_ID

  if (!token || !phoneNumberId) {
    console.warn('[WhatsApp] Variables META no configuradas — mensaje omitido')
    return false
  }

  try {
    const res = await fetch(`${GRAPH_URL}/${phoneNumberId}/messages`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: to.replace(/\s/g, ''),
        type: 'text',
        text: { preview_url: false, body: message },
      }),
    })

    if (!res.ok) {
      const err = await res.text()
      console.error('[WhatsApp] Error API Meta:', err)
      return false
    }

    return true
  } catch (err) {
    console.error('[WhatsApp] Error enviando mensaje:', err)
    return false
  }
}
