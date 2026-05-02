import { notFound } from 'next/navigation'
import { getTenantBySlug } from '@/lib/tenant/resolver'
import { generateThemeCSS } from '@/lib/tenant/theme'
import type { Metadata } from 'next'

interface Props {
  children: React.ReactNode
  params: Promise<{ tenant: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tenant: slug } = await params
  const tenant = await getTenantBySlug(slug)
  if (!tenant) return { title: 'Negocio no encontrado' }
  return {
    title: tenant.name,
    description: tenant.welcome_message ?? `Reserva tu cita en ${tenant.name}`,
  }
}

export default async function TenantLayout({ children, params }: Props) {
  const { tenant: slug } = await params
  const tenant = await getTenantBySlug(slug)
  if (!tenant) notFound()

  const themeCSS = generateThemeCSS(tenant)

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: themeCSS }} />
      <div className="booking-page">
        {children}
      </div>
    </>
  )
}
