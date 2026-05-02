'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import { APP_CONFIG, slugify } from '@/lib/utils'
import { Zap } from 'lucide-react'
import type { BusinessType } from '@/types/database'

const BUSINESS_TYPES: { value: BusinessType; label: string; emoji: string }[] = [
  { value: 'barbershop', label: 'Barbería',         emoji: '💈' },
  { value: 'salon',      label: 'Salón de belleza', emoji: '💅' },
  { value: 'spa',        label: 'Spa',              emoji: '🧖' },
  { value: 'nail',       label: 'Nail studio',      emoji: '💄' },
  { value: 'tattoo',     label: 'Estudio de tatuajes', emoji: '🖋️' },
  { value: 'general',    label: 'Otro negocio',     emoji: '🏢' },
]

export default function RegisterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    businessName: '',
    businessType: 'barbershop' as BusinessType,
    ownerName: '',
    email: '',
    password: '',
  })

  const slug = slugify(form.businessName)

  function update(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    if (!slug) { toast.error('El nombre del negocio es requerido'); return }
    setLoading(true)
    try {
      const res = await fetch('/api/tenants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug,
          name: form.businessName,
          business_type: form.businessType,
          owner_email: form.email,
          owner_password: form.password,
          owner_name: form.ownerName,
        }),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error ?? 'Error al registrar'); setLoading(false); return }
      toast.success('¡Negocio registrado! Iniciando sesión...')
      router.push('/dashboard')
    } catch {
      toast.error('Error de red, intenta de nuevo')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-dvh flex items-center justify-center bg-[#080810] px-4 py-12">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-2 mb-8 justify-center">
          <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="text-white font-semibold text-lg">{APP_CONFIG.name}</span>
        </div>

        <div className="glass rounded-2xl p-8">
          <h1 className="text-xl font-semibold text-white mb-1">Registra tu negocio</h1>
          <p className="text-sm text-[#64748b] mb-6">14 días gratis, sin tarjeta</p>

          <form onSubmit={handleRegister} className="space-y-4">
            {/* Tipo de negocio */}
            <div>
              <label className="block text-xs font-medium text-[#94a3b8] mb-2">
                Tipo de negocio
              </label>
              <div className="grid grid-cols-2 gap-2">
                {BUSINESS_TYPES.map(bt => (
                  <button
                    key={bt.value}
                    type="button"
                    onClick={() => update('businessType', bt.value)}
                    className={`flex items-center gap-2 p-2.5 rounded-lg border text-sm transition-colors ${
                      form.businessType === bt.value
                        ? 'border-violet-500 bg-violet-500/10 text-violet-300'
                        : 'border-white/8 bg-white/3 text-[#94a3b8] hover:border-white/15'
                    }`}
                  >
                    <span>{bt.emoji}</span>
                    <span className="text-xs font-medium">{bt.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Nombre del negocio */}
            <div>
              <label className="block text-xs font-medium text-[#94a3b8] mb-1.5">
                Nombre del negocio
              </label>
              <input
                type="text"
                value={form.businessName}
                onChange={e => update('businessName', e.target.value)}
                placeholder="Barbería Don Carlos"
                required
                className="input-dark"
              />
              {slug && (
                <p className="text-xs text-[#64748b] mt-1">
                  Tu URL: <span className="text-violet-400">/b/{slug}</span>
                </p>
              )}
            </div>

            {/* Nombre del dueño */}
            <div>
              <label className="block text-xs font-medium text-[#94a3b8] mb-1.5">
                Tu nombre
              </label>
              <input
                type="text"
                value={form.ownerName}
                onChange={e => update('ownerName', e.target.value)}
                placeholder="Carlos Mendoza"
                required
                className="input-dark"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-medium text-[#94a3b8] mb-1.5">
                Correo electrónico
              </label>
              <input
                type="email"
                value={form.email}
                onChange={e => update('email', e.target.value)}
                placeholder="tu@correo.com"
                required
                className="input-dark"
              />
            </div>

            {/* Contraseña */}
            <div>
              <label className="block text-xs font-medium text-[#94a3b8] mb-1.5">
                Contraseña
              </label>
              <input
                type="password"
                value={form.password}
                onChange={e => update('password', e.target.value)}
                placeholder="Mínimo 8 caracteres"
                minLength={8}
                required
                className="input-dark"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white font-medium text-sm transition-colors disabled:opacity-60"
            >
              {loading ? 'Creando cuenta...' : 'Crear negocio gratis'}
            </button>
          </form>

          <p className="text-center text-xs text-[#64748b] mt-6">
            ¿Ya tienes cuenta?{' '}
            <Link href="/login" className="text-violet-400 hover:text-violet-300">
              Iniciar sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
