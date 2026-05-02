import type { Metadata } from 'next'
import { Toaster } from 'sonner'
import './globals.css'
import { APP_CONFIG } from '@/lib/utils'

export const metadata: Metadata = {
  title: {
    default: APP_CONFIG.name,
    template: `%s — ${APP_CONFIG.name}`,
  },
  description: 'Sistema de reservas online para tu negocio. Barberías, salones, spas y más.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#1a1a28',
              border: '1px solid rgba(255,255,255,0.08)',
              color: '#f1f5f9',
            },
          }}
        />
      </body>
    </html>
  )
}
