# 💈 BOOKING SAAS — AGENTE COMPLETO
## Sistema White-Label de Reservas | Barberías & Salones | Guatemala → LATAM

> **Stack:** Next.js 14 + Supabase + Stripe/Wompi + Meta WhatsApp API  
> **Costo inicial:** $0–10/mes | **Escalable** a miles de clientes  
> **White-label:** Cambiar logo + colores = 2 variables CSS, sin tocar código

---

## 🎨 WHITE-LABEL — CÓMO FUNCIONA

El corazón del negocio. Cada cliente (barbería) tiene su propia marca sin que
tú toques código. Funciona con CSS variables globales:

```css
/* globals.css — se genera dinámicamente por tenant */
:root {
  --color-primary:    #1a1a2e;   /* color principal del negocio */
  --color-secondary:  #e94560;   /* color de acento / botones */
  --color-bg:         #ffffff;   /* fondo */
  --color-text:       #111111;   /* texto */
  --logo-url:         url('/logos/tenant-slug.png');
  --font-main:        'Inter', sans-serif;
  --border-radius:    8px;       /* estilo de bordes */
}
```

### ¿Cómo cambia por cliente?
```typescript
// lib/tenant/theme.ts
// Al resolver el tenant, inyectas sus variables en el <head>
export function generateThemeCSS(tenant: Tenant): string {
  return `
    :root {
      --color-primary: ${tenant.primary_color};
      --color-secondary: ${tenant.secondary_color};
      --color-bg: ${tenant.bg_color};
      --color-text: ${tenant.text_color};
      --border-radius: ${tenant.border_radius}px;
    }
  `;
}

// app/[tenant]/layout.tsx
// Next.js lo aplica server-side = sin parpadeo de colores
export default async function TenantLayout({ params }) {
  const tenant = await getTenantBySlug(params.tenant);
  const themeCSS = generateThemeCSS(tenant);
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: themeCSS }} />
      {children}
    </>
  );
}
```

### En Tailwind usas las variables así:
```javascript
// tailwind.config.js
theme: {
  extend: {
    colors: {
      primary:   'var(--color-primary)',
      secondary: 'var(--color-secondary)',
      bg:        'var(--color-bg)',
    }
  }
}

// En componentes: className="bg-primary text-white hover:bg-secondary"
// El color cambia automáticamente por tenant ✅
```

### ¿Qué puede cambiar el dueño del negocio?
```
✅ Logo (subida a Supabase Storage)
✅ Color principal (picker visual)
✅ Color secundario / botones
✅ Color de fondo
✅ Nombre del negocio
✅ Foto de portada / banner
✅ Dominio propio (Plan Pro)
✅ Nombre que aparece en WhatsApp
✅ Mensaje de bienvenida en la página
```

---

## 🏗️ ARQUITECTURA MULTI-TENANT

```
SUBDOMINIO (gratis):    barberia-lopez.tunegocio.com
DOMINIO PROPIO (Pro):   barberia-lopez.com

┌─────────────────────────────────────────────────────┐
│  Next.js — middleware.ts resuelve el tenant         │
│                                                     │
│  Request: barberia-lopez.tunegocio.com/book         │
│     ↓                                               │
│  1. Lee subdominio → "barberia-lopez"               │
│  2. Busca en DB: SELECT * FROM tenants              │
│     WHERE slug = 'barberia-lopez'                   │
│  3. Inyecta tenant_id en headers                    │
│  4. Carga su tema (colores + logo)                  │
│  5. Renderiza la página con su marca                │
└─────────────────────────────────────────────────────┘

BASE DE DATOS:
  Un solo proyecto Supabase
  Todas las tablas tienen tenant_id
  Row Level Security (RLS) garantiza aislamiento
  → Tenant A NUNCA puede ver datos de Tenant B
```

### middleware.ts (el corazón del multi-tenant)
```typescript
// middleware.ts
import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';
  const APP_DOMAIN = process.env.NEXT_PUBLIC_APP_DOMAIN!; // tunegocio.com

  // Extrae el slug del subdominio
  const slug = hostname
    .replace(`.${APP_DOMAIN}`, '')
    .replace('www.', '');

  // Si es el dominio raíz, no hacer nada (landing de tu SaaS)
  if (slug === APP_DOMAIN || slug === 'www') {
    return NextResponse.next();
  }

  // Pasa el slug como header para usarlo en las páginas
  const response = NextResponse.next();
  response.headers.set('x-tenant-slug', slug);
  return response;
}
```

---

## 📁 ESTRUCTURA DE CARPETAS

```
booking-saas/
├── app/
│   ├── (public)/                        ← Sin autenticación
│   │   ├── [tenant]/                    ← Página del negocio (cliente reserva aquí)
│   │   │   ├── layout.tsx               ← Carga tema del tenant (colores/logo)
│   │   │   ├── page.tsx                 ← Landing del negocio
│   │   │   ├── book/
│   │   │   │   ├── page.tsx             ← Flujo de reserva (wizard 6 pasos)
│   │   │   │   └── [step]/page.tsx      ← Cada paso como ruta
│   │   │   └── confirmation/
│   │   │       └── page.tsx             ← Cita confirmada ✅
│   │   └── page.tsx                     ← Landing de TU SaaS (vendes membresías)
│   │
│   ├── (dashboard)/                     ← Panel del dueño del negocio
│   │   ├── layout.tsx                   ← Sidebar + auth guard
│   │   └── dashboard/
│   │       ├── page.tsx                 ← Resumen del día
│   │       ├── appointments/
│   │       │   ├── page.tsx             ← Lista de citas
│   │       │   └── [id]/page.tsx        ← Detalle de cita
│   │       ├── staff/
│   │       │   ├── page.tsx             ← Lista de empleados
│   │       │   └── [id]/page.tsx        ← Perfil + horarios del empleado
│   │       ├── services/page.tsx        ← Servicios y precios
│   │       ├── schedule/page.tsx        ← Horarios generales
│   │       ├── payments/page.tsx        ← Anticipos recibidos
│   │       ├── clients/page.tsx         ← CRM básico
│   │       ├── reports/page.tsx         ← Gráficas e ingresos
│   │       └── settings/
│   │           ├── page.tsx             ← Config general
│   │           ├── branding/page.tsx    ← Logo + colores (WHITE-LABEL)
│   │           ├── domain/page.tsx      ← Dominio propio
│   │           └── policies/page.tsx    ← % anticipo, cancelaciones
│   │
│   ├── (staff)/                         ← Panel del barbero/empleado
│   │   ├── layout.tsx
│   │   └── staff/
│   │       ├── my-day/page.tsx          ← Su agenda de hoy
│   │       ├── schedule/page.tsx        ← Sus horarios semanales
│   │       └── profile/page.tsx         ← Su perfil público
│   │
│   ├── (auth)/                          ← Login / registro
│   │   ├── login/page.tsx
│   │   └── register/page.tsx            ← Registro de nuevo negocio
│   │
│   └── api/
│       ├── appointments/
│       │   ├── route.ts                 ← GET lista, POST crear
│       │   └── [id]/route.ts            ← GET, PATCH, DELETE
│       ├── availability/route.ts        ← GET slots disponibles
│       ├── payments/
│       │   ├── create-intent/route.ts   ← Crear PaymentIntent Stripe
│       │   └── webhook/route.ts         ← Stripe webhooks
│       ├── notifications/
│       │   └── whatsapp/route.ts        ← Enviar mensajes
│       └── tenants/
│           ├── route.ts                 ← Crear tenant (registro)
│           └── [slug]/route.ts          ← Info pública del tenant
│
├── components/
│   ├── booking/                         ← Flujo de reserva (cliente)
│   │   ├── BookingWizard.tsx            ← Componente principal (maneja pasos)
│   │   ├── steps/
│   │   │   ├── ServiceStep.tsx          ← Paso 2: elegir servicio
│   │   │   ├── StaffStep.tsx            ← Paso 3: elegir barbero
│   │   │   ├── DateTimeStep.tsx         ← Paso 4: fecha y hora
│   │   │   ├── ClientInfoStep.tsx       ← Paso 5: datos del cliente
│   │   │   └── PaymentStep.tsx          ← Paso 6: pagar anticipo
│   │   └── ConfirmationCard.tsx         ← Paso 7: confirmación
│   │
│   ├── dashboard/
│   │   ├── Sidebar.tsx
│   │   ├── AppointmentCard.tsx
│   │   ├── StaffCalendar.tsx            ← Vista agenda por barbero
│   │   ├── DayOverview.tsx              ← Resumen del día
│   │   └── ReportsChart.tsx
│   │
│   ├── settings/
│   │   └── BrandingEditor.tsx           ← Editor visual colores + logo
│   │
│   └── ui/                              ← shadcn/ui (Button, Card, etc.)
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts                    ← Cliente browser
│   │   ├── server.ts                    ← Cliente server (SSR)
│   │   └── types.ts                     ← Tipos generados de la DB
│   ├── stripe/
│   │   ├── client.ts
│   │   └── helpers.ts                   ← Crear intents, reembolsos
│   ├── whatsapp/
│   │   ├── client.ts                    ← Meta Cloud API
│   │   └── templates.ts                 ← Plantillas de mensajes
│   ├── tenant/
│   │   ├── resolver.ts                  ← Obtener tenant por slug
│   │   └── theme.ts                     ← Generar CSS del tema
│   └── availability/
│       └── calculator.ts                ← Lógica de slots disponibles
│
├── middleware.ts                        ← Resolución multi-tenant
├── .env.local                           ← Variables de entorno
├── tailwind.config.js
├── next.config.js
└── package.json
```

---

## 🗄️ BASE DE DATOS COMPLETA (Supabase / PostgreSQL)

```sql
-- ============================================================
-- TENANTS — cada negocio que paga membresía
-- ============================================================
CREATE TABLE tenants (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug              TEXT UNIQUE NOT NULL,       -- "barberia-lopez"
  name              TEXT NOT NULL,              -- "Barbería López"
  plan              TEXT DEFAULT 'basic'
                    CHECK (plan IN ('basic','pro','elite')),

  -- ── WHITE-LABEL ──────────────────────────────────────────
  primary_color     TEXT DEFAULT '#1a1a2e',     -- color principal
  secondary_color   TEXT DEFAULT '#e94560',     -- botones / acento
  bg_color          TEXT DEFAULT '#ffffff',     -- fondo
  text_color        TEXT DEFAULT '#111111',     -- texto
  border_radius     INTEGER DEFAULT 8,          -- px redondeado
  logo_url          TEXT,                       -- Supabase Storage
  cover_url         TEXT,                       -- foto de portada
  welcome_message   TEXT,                       -- mensaje en la landing
  font              TEXT DEFAULT 'Inter',

  -- ── POLÍTICAS DE CITAS ───────────────────────────────────
  deposit_percent   INTEGER DEFAULT 50          -- % anticipo requerido
                    CHECK (deposit_percent BETWEEN 0 AND 100),
  cancel_hours      INTEGER DEFAULT 24,         -- horas para cancelar gratis
  min_advance_hours INTEGER DEFAULT 1,          -- anticipación mínima
  max_advance_days  INTEGER DEFAULT 30,         -- máximo días en adelanto

  -- ── PAGOS ────────────────────────────────────────────────
  stripe_account_id TEXT,                       -- Stripe Connect
  payment_methods   TEXT[] DEFAULT '{"card"}',  -- card | transfer | cash

  -- ── INFO DEL NEGOCIO ─────────────────────────────────────
  phone             TEXT,
  whatsapp          TEXT,
  address           TEXT,
  city              TEXT,
  country           TEXT DEFAULT 'GT',
  timezone          TEXT DEFAULT 'America/Guatemala',
  instagram         TEXT,
  facebook          TEXT,

  -- ── CONTROL ──────────────────────────────────────────────
  is_active         BOOLEAN DEFAULT true,
  trial_ends_at     TIMESTAMPTZ,
  subscription_id   TEXT,                       -- ID suscripción Stripe
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- STAFF — empleados / barberos
-- ============================================================
CREATE TABLE staff (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id         UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id           UUID REFERENCES auth.users(id),  -- login Supabase
  name              TEXT NOT NULL,
  role              TEXT DEFAULT 'staff'
                    CHECK (role IN ('owner','manager','staff')),
  avatar_url        TEXT,
  bio               TEXT,
  specialty         TEXT,                       -- "Fade, degradados"
  is_active         BOOLEAN DEFAULT true,
  sort_order        INTEGER DEFAULT 0,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SERVICES — corte, barba, tinte, etc.
-- ============================================================
CREATE TABLE services (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id         UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name              TEXT NOT NULL,              -- "Corte clásico"
  description       TEXT,
  duration_min      INTEGER NOT NULL            -- duración en minutos
                    CHECK (duration_min > 0),
  price             DECIMAL(10,2) NOT NULL
                    CHECK (price >= 0),
  deposit_amount    DECIMAL(10,2),              -- NULL = usa % del tenant
  requires_deposit  BOOLEAN DEFAULT true,
  is_active         BOOLEAN DEFAULT true,
  sort_order        INTEGER DEFAULT 0,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- STAFF_SERVICES — qué servicios hace cada barbero
-- ============================================================
CREATE TABLE staff_services (
  staff_id          UUID REFERENCES staff(id) ON DELETE CASCADE,
  service_id        UUID REFERENCES services(id) ON DELETE CASCADE,
  PRIMARY KEY (staff_id, service_id)
);

-- ============================================================
-- SCHEDULES — horario semanal de cada empleado
-- ============================================================
CREATE TABLE schedules (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id          UUID NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
  tenant_id         UUID NOT NULL REFERENCES tenants(id),
  day_of_week       INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  -- 0=Domingo, 1=Lunes, 2=Martes ... 6=Sábado
  start_time        TIME NOT NULL,              -- "08:00"
  end_time          TIME NOT NULL,              -- "18:00"
  is_working        BOOLEAN DEFAULT true,
  break_start       TIME,                       -- "13:00" almuerzo
  break_end         TIME,                       -- "14:00"
  UNIQUE (staff_id, day_of_week)
);

-- ============================================================
-- BLOCKED_TIMES — días libres, vacaciones, bloqueos
-- ============================================================
CREATE TABLE blocked_times (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id          UUID REFERENCES staff(id) ON DELETE CASCADE,
  tenant_id         UUID NOT NULL REFERENCES tenants(id),
  start_at          TIMESTAMPTZ NOT NULL,
  end_at            TIMESTAMPTZ NOT NULL,
  reason            TEXT,                       -- "Vacaciones", "Enfermedad"
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- CLIENTS — clientes del negocio (no de tu SaaS)
-- ============================================================
CREATE TABLE clients (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id         UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name              TEXT NOT NULL,
  phone             TEXT,                       -- número WhatsApp
  email             TEXT,
  notes             TEXT,                       -- preferencias, alergias
  -- Stats automáticos (se actualizan con triggers)
  total_visits      INTEGER DEFAULT 0,
  total_spent       DECIMAL(10,2) DEFAULT 0,
  no_shows          INTEGER DEFAULT 0,
  last_visit        TIMESTAMPTZ,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (tenant_id, phone)
);

-- ============================================================
-- APPOINTMENTS — las citas (tabla más importante)
-- ============================================================
CREATE TABLE appointments (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id         UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  staff_id          UUID NOT NULL REFERENCES staff(id),
  service_id        UUID NOT NULL REFERENCES services(id),
  client_id         UUID REFERENCES clients(id),

  starts_at         TIMESTAMPTZ NOT NULL,
  ends_at           TIMESTAMPTZ NOT NULL,

  -- Estado del flujo completo
  status            TEXT DEFAULT 'pending'
                    CHECK (status IN (
                      'pending',            -- recién creada
                      'awaiting_payment',   -- esperando anticipo
                      'confirmed',          -- anticipo pagado ✅
                      'completed',          -- servicio realizado ✅
                      'cancelled',          -- cancelada
                      'no_show'             -- no se presentó ❌
                    )),

  -- Precios capturados al momento de reservar
  price_total       DECIMAL(10,2) NOT NULL,
  deposit_amount    DECIMAL(10,2) NOT NULL,
  deposit_paid      BOOLEAN DEFAULT false,
  balance_due       DECIMAL(10,2),             -- resto que paga en persona

  -- Notas
  client_notes      TEXT,                      -- nota del cliente al reservar
  staff_notes       TEXT,                      -- nota interna del barbero

  -- Cancelación
  cancelled_at      TIMESTAMPTZ,
  cancel_reason     TEXT,
  cancelled_by      TEXT,                      -- 'client' | 'staff' | 'system'
  refund_issued     BOOLEAN DEFAULT false,

  -- Creación
  source            TEXT DEFAULT 'online',     -- 'online' | 'manual' | 'walkin'
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- PAYMENTS — registro de cada transacción
-- ============================================================
CREATE TABLE payments (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id      UUID REFERENCES appointments(id),
  tenant_id           UUID NOT NULL REFERENCES tenants(id),
  stripe_payment_id   TEXT UNIQUE,
  stripe_refund_id    TEXT,
  amount              DECIMAL(10,2) NOT NULL,
  currency            TEXT DEFAULT 'gtq',
  type                TEXT CHECK (type IN ('deposit','balance','refund','full')),
  status              TEXT DEFAULT 'pending'
                      CHECK (status IN ('pending','completed','refunded','failed')),
  payment_method      TEXT,                    -- 'card' | 'transfer' | 'cash'
  paid_at             TIMESTAMPTZ,
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- NOTIFICATIONS — log de mensajes enviados
-- ============================================================
CREATE TABLE notifications (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id    UUID REFERENCES appointments(id),
  tenant_id         UUID NOT NULL REFERENCES tenants(id),
  type              TEXT CHECK (type IN (
                      'confirmation','reminder_24h',
                      'reminder_2h','cancellation','no_show_alert'
                    )),
  channel           TEXT CHECK (channel IN ('whatsapp','email')),
  status            TEXT DEFAULT 'pending'
                    CHECK (status IN ('pending','sent','failed')),
  error_msg         TEXT,
  sent_at           TIMESTAMPTZ,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ROW LEVEL SECURITY — los tenants nunca ven datos ajenos
-- ============================================================
ALTER TABLE staff           ENABLE ROW LEVEL SECURITY;
ALTER TABLE services        ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedules       ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients         ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments    ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments        ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications   ENABLE ROW LEVEL SECURITY;

-- Política base (se replica en todas las tablas protegidas)
CREATE POLICY "tenant_isolation" ON appointments
  USING (tenant_id = (
    SELECT tenant_id FROM staff
    WHERE user_id = auth.uid()
    LIMIT 1
  ));
-- Repetir patrón para cada tabla ↑
```

---

## 👤 FLUJO DEL CLIENTE — RESERVA PÚBLICA

**URL:** `barberia-lopez.tunegocio.com`

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PASO 1 — LANDING DEL NEGOCIO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  [ LOGO del negocio ]     ← cargado de Supabase Storage
  [ Foto de portada ]      ← personalizable
  [ Nombre del negocio ]
  [ Mensaje de bienvenida personalizado ]

  ┌─────────────────────────────────────┐
  │   RESERVAR AHORA →                  │  ← botón color primario
  └─────────────────────────────────────┘

  Nuestros servicios:
  ✂️  Corte clásico    Q50   30 min
  🪒 Barba completa   Q40   20 min
  💈 Corte + Barba    Q80   50 min

  📍 Dirección | 🕐 Lun-Sab 8am–7pm | 📞 WhatsApp

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PASO 2 — ELEGIR SERVICIO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ┌─────────────────┐  ┌─────────────────┐
  │ ✂️  Corte clásico │  │  🪒 Barba        │
  │  30 min · Q50   │  │  20 min · Q40   │
  └─────────────────┘  └─────────────────┘
  ┌─────────────────┐  ┌─────────────────┐
  │ 💈 Corte+Barba  │  │  🎨 Tinte        │
  │  50 min · Q80   │  │  90 min · Q150  │
  └─────────────────┘  └─────────────────┘
  → Tap para seleccionar, continuar automático

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PASO 3 — ELEGIR BARBERO (opcional)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ┌───────────┐  ┌───────────┐  ┌───────────┐
  │  [Foto]   │  │  [Foto]   │  │    ❓     │
  │  Carlos   │  │  Miguel   │  │ Sin pref. │
  └───────────┘  └───────────┘  └───────────┘

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PASO 4 — ELEGIR FECHA Y HORA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  [ Enero 2025 ]   <  >
  Lun  Mar  Mié  Jue  Vie  Sáb
  ─    ─    ─    ─    ─    ─
  ─    ─    ─    ─    ─    ─
  13✅ 14✅ 15❌ 16✅ 17✅ 18✅
  20✅ 21✅ 22✅ 23✅ 24✅ 25✅

  Horas disponibles para Jue 16:
  [9:00] [9:30] [11:00] [11:30] [3:00] [4:30]
  (Los slots ocupados o fuera de horario NO aparecen)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PASO 5 — TUS DATOS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Nombre completo:   [_________________________]
  WhatsApp:          [+502 ___________________]
  ↑ solo para el recordatorio automático

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PASO 6 — CONFIRMAR Y PAGAR ANTICIPO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ╔══════════════════════════════════════════╗
  ║  RESUMEN DE TU CITA                     ║
  ║  ✂️  Corte clásico                       ║
  ║  👤  Carlos                             ║
  ║  📅  Jueves 16 Enero, 3:00 PM           ║
  ║  ⏱   30 minutos                         ║
  ║  ─────────────────────────────────────  ║
  ║  Total del servicio:     Q 50.00        ║
  ║  Anticipo ahora (50%):   Q 25.00        ║
  ║  Resto en persona:       Q 25.00        ║
  ║                                         ║
  ║  ⚠️  Cancela con 24hrs → reembolso      ║
  ║      Si no asistes → pierdes el anticipo║
  ╚══════════════════════════════════════════╝

  [ 💳 Pagar Q25 con tarjeta → ]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PASO 7 — CONFIRMACIÓN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ✅  ¡Cita confirmada!

  📱 Te enviamos un WhatsApp con todos los detalles
  ⏰ Recordatorio automático 2 horas antes

  [ Agregar a calendario ]   [ Volver al inicio ]
```

---

## 🏠 PANEL DEL DUEÑO

### 📊 Resumen del Día
```
┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
│ 12 Citas │  │ Q840 hoy │  │ 2 Libres │  │ 1 No-show│
│ del día  │  │ esperado │  │ en agenda│  │  de ayer │
└──────────┘  └──────────┘  └──────────┘  └──────────┘

AGENDA DEL DÍA (vista lado a lado por barbero):

CARLOS                        MIGUEL
08:00  ─────────────────      08:00  Juan López     ✅ Conf.
08:30  [LIBRE]                08:30  ─────────────
09:00  Pedro Rm.    ✅ Conf.  09:00  Ana García     ✅ Conf.
09:30  ─────────────         09:30  ─────────────
10:00  Luis Méndez  ⏳ Pend.  10:00  [LIBRE]
...

[+ Nueva cita manual] ← para clientes que llaman por teléfono
```

### 📅 Gestión de Citas
```
Filtros: [Hoy ▾] [Todos los barberos ▾] [Todos los estados ▾]

HORA      CLIENTE        BARBERO   SERVICIO    TOTAL  DEPÓSITO  ESTADO
Hoy 9:00  Juan Pérez     Carlos    Corte       Q50    Q25 ✅    ✅ Confirmada
Hoy 9:30  Ana López      Miguel    Barba       Q40    Q20 ✅    ✅ Confirmada
Hoy 10:00 Luis Méndez    Carlos    Corte+B.    Q80    Q40 ❌    ⏳ Sin pago
Mañana... [...]

Acciones por fila: [Ver detalle] [Marcar completada] [No-show] [Cancelar]
```

### ⚙️ Configuración White-Label (settings/branding)
```
IDENTIDAD VISUAL
  Logo actual:     [Vista previa]    [Cambiar logo]
  Foto portada:    [Vista previa]    [Cambiar foto]

  Color principal:   [ ████ #1a1a2e ]  ← color picker visual
  Color secundario:  [ ████ #e94560 ]
  Color de fondo:    [ ████ #ffffff ]
  Bordes:            [ Redondeados 8px ▾]

  Vista previa en tiempo real →  [📱 Mobile] [💻 Desktop]

TEXTOS
  Nombre del negocio:   [Barbería López________________]
  Mensaje bienvenida:   [Bienvenido, reserva tu cita..._]
  WhatsApp visible:     [+502 ____________________]

DOMINIO
  Subdominio gratis:    barberia-lopez.tunegocio.com  ✅
  Dominio propio:       [mi-dominio.com_____________]  🔒 Plan Pro

POLÍTICAS
  Anticipo requerido:      [50] %
  Cancelación gratis:      [24] horas antes
  Anticipación mínima:     [ 1] hora
  Máximo días adelante:    [30] días

  [Guardar cambios]
```

---

## 👷 PANEL DEL BARBERO

```
MI DÍA — Carlos — Jueves 16 Enero

PRÓXIMA CITA:
┌──────────────────────────────────────────┐
│  👤 Juan Pérez   📱 +502 5555-1234       │
│  ✂️  Corte clásico — 30 minutos          │
│  ⏰ 9:00 AM — en 45 minutos              │
│  💬 "Sin nada en las orejas por favor"   │
└──────────────────────────────────────────┘

AGENDA COMPLETA HOY:
9:00   Juan Pérez    Corte clásico  30min  [✅ Listo] [❌ No vino]
9:30   [LIBRE 30min]
10:00  Luis Méndez   Corte+Barba    50min  Próxima
10:50  [LIBRE 10min]
11:00  Carlos Ruiz   Barba          20min
...

ACCIONES RÁPIDAS:
[ 🔒 Bloquear almuerzo ]  [ 📅 Ver semana ]  [ 🚫 Reportar ausencia ]
```

---

## 🔔 SISTEMA DE NOTIFICACIONES (Solo WhatsApp)

```javascript
// lib/whatsapp/templates.ts

// ✅ 1. CONFIRMACIÓN — se envía inmediatamente al pagar
const CONFIRMATION = `
✅ *¡Cita confirmada en {{negocio}}!*

📅 {{fecha_larga}}
⏰ {{hora}}
✂️ {{servicio}}
👤 Con: {{barbero}}
📍 {{direccion}}

💰 Anticipo pagado: Q{{deposito}}
💵 Resto a pagar en persona: Q{{balance}}

⚠️ _Para cancelar sin costo, hazlo antes de {{hora_limite_cancelacion}}_

Responde *CANCELAR* si no puedes asistir.
`;

// ⏰ 2. RECORDATORIO 24 HRS — cron job a las 9am
const REMINDER_24H = `
⏰ *Recordatorio de cita — {{negocio}}*

Mañana tienes cita a las *{{hora}}* con {{barbero}}
✂️ {{servicio}}

¿No puedes asistir? Responde *CANCELAR* antes de las {{hora_limite}}
para recibir tu reembolso de Q{{deposito}}.
`;

// 💈 3. RECORDATORIO 2 HRS — cron job dinámico
const REMINDER_2H = `
💈 *¡Tu cita es en 2 horas!*

⏰ Hoy a las *{{hora}}* con {{barbero}}
📍 {{direccion}}

¡Te esperamos en {{negocio}}! 🙌
`;

// ❌ 4. CANCELACIÓN CON REEMBOLSO
const CANCELLATION_REFUND = `
✅ *Cita cancelada — {{negocio}}*

Tu cita del {{fecha}} a las {{hora}} fue cancelada.
💰 Reembolso de *Q{{monto}}* procesado — llega en 3-5 días hábiles.

¡Esperamos verte pronto! 😊
`;

// 🚫 5. NO-SHOW (sin reembolso)
const NO_SHOW = `
😔 *Cita no asistida — {{negocio}}*

Notamos que no pudiste venir a tu cita del {{fecha}}.
El anticipo de Q{{deposito}} no es reembolsable por política de no-show.

Para tu próxima cita: {{link_reserva}}
`;
```

### Cron jobs para recordatorios (Supabase Edge Functions)
```typescript
// supabase/functions/send-reminders/index.ts
// Se ejecuta cada hora

const now = new Date();

// Buscar citas que necesitan recordatorio en las próximas 24hrs
const { data: reminders24h } = await supabase
  .from('appointments')
  .select('*, clients(*), staff(*), tenants(*), services(*)')
  .eq('status', 'confirmed')
  .gte('starts_at', addHours(now, 23))
  .lte('starts_at', addHours(now, 25))
  .is('notifications.sent_at', null)  // no enviado aún
  .eq('notifications.type', 'reminder_24h');

// Buscar citas que necesitan recordatorio en las próximas 2hrs
const { data: reminders2h } = await supabase
  .from('appointments')
  .select('...')
  .gte('starts_at', addHours(now, 1.5))
  .lte('starts_at', addHours(now, 2.5));

// Enviar WhatsApp a cada uno
for (const appt of [...reminders24h, ...reminders2h]) {
  await sendWhatsApp(appt.clients.phone, template, variables);
  await logNotification(appt.id, 'sent');
}
```

---

## 🚀 FASES DE DESARROLLO

### FASE 1 — MVP (semanas 1–8) | Gratis para primeros 5 clientes
```
✅ Arquitectura multi-tenant base
✅ White-label: colores + logo + CSS variables
✅ Gestión de servicios con precios
✅ Gestión de staff y horarios semanales
✅ Cálculo de disponibilidad (slots libres)
✅ Flujo de reserva público (6 pasos, mobile-first)
✅ Pago de anticipo con Stripe / Wompi
✅ Notificaciones WhatsApp (confirmación + 2 recordatorios)
✅ Dashboard dueño: agenda del día + gestión de citas
✅ Panel barbero: mi día
✅ Cancelaciones y reembolsos automáticos
✅ Bloqueo de no-shows (anticipo obligatorio)
```

### FASE 2 — Producto (semanas 9–14) | Q150–300/mes
```
🔲 Reportes: ingresos diarios/semanales, servicios top, horas pico
🔲 CRM básico: historial por cliente, total gastado, no-shows
🔲 Dominio propio por tenant (DNS automático)
🔲 Múltiples sucursales (hasta 3 en Plan Pro)
🔲 PWA instalable en celular (sin App Store)
🔲 Cita manual desde el dashboard (para reservas por teléfono)
🔲 Visanet/Wompi para depósito directo en GT
```

### FASE 3 — Escala (mes 4+) | Q300–600/mes
```
🔲 Marketplace público: "barberías cerca de mí"
🔲 Sistema de reseñas y calificaciones
🔲 Programa de lealtad / puntos / membresías del cliente
🔲 App nativa iOS/Android (React Native, mismo código)
🔲 API pública para integraciones
🔲 Panel de revendedores (comisión para quien vende tu SaaS)
🔲 Expansión México/Colombia con pasarelas locales
```

---

## 💳 MODELO DE PRICING

```
┌──────────────────────────────────────────────────────┐
│  BÁSICO — Q150/mes (~$19 USD)                        │
│  ✅ 1 sede                                           │
│  ✅ Hasta 3 empleados                                │
│  ✅ Reservas online ilimitadas                       │
│  ✅ Notificaciones WhatsApp                          │
│  ✅ Subdominio gratis (negocio.tunegocio.com)        │
│  ✅ Logo y colores personalizados                    │
├──────────────────────────────────────────────────────┤
│  PRO — Q300/mes (~$38 USD)                           │
│  ✅ Todo lo anterior                                 │
│  ✅ Hasta 10 empleados                               │
│  ✅ Dominio propio incluido                          │
│  ✅ Reportes y estadísticas                          │
│  ✅ CRM de clientes                                  │
│  ✅ Hasta 3 sucursales                               │
├──────────────────────────────────────────────────────┤
│  ELITE — Q600/mes (~$77 USD)                         │
│  ✅ Todo lo anterior                                 │
│  ✅ Empleados ilimitados                             │
│  ✅ Sucursales ilimitadas                            │
│  ✅ White-label total (sin mención de tu marca)      │
│  ✅ Soporte prioritario                              │
└──────────────────────────────────────────────────────┘

PROYECCIÓN:
  50 clientes Básico  = Q  7,500
  20 clientes Pro     = Q  6,000
   5 clientes Elite   = Q  3,000
  ──────────────────────────────
  75 clientes TOTAL   = Q 16,500/mes (~$2,100 USD)
  Costo infraestructura:    ~$50/mes
  ──────────────────────────────
  GANANCIA NETA       = ~$2,050 USD/mes
```

---

## 💵 PAGOS EN GUATEMALA — ESTRATEGIA

```
ETAPA 1 (MVP — primeros clientes):
  Stripe + Wise
  → Stripe cobra al cliente (tarjeta Visa/MC)
  → Deposita a tu cuenta Wise (USD)
  → Wise transfiere a banco guatemalteco
  → Comisión total: ~2.9% + $0.30 por tx + ~1% Wise
  → Setup: 1 día

ETAPA 2 (20+ clientes pagando):
  Visanet Guatemala O Wompi
  → Depósito directo en quetzales a tu banco
  → Comisión: ~3% sin fee mensual (Wompi)
  → Requiere: NIT, cuenta bancaria GT, documentos empresa
  → Setup: 1-2 semanas

PARA TUS CLIENTES (barberías):
  → Tú les recibes el anticipo del cliente final
  → Se lo depositas menos tu comisión de plataforma (opcional)
  → O usas Stripe Connect: el anticipo va directo al negocio
    y Stripe te paga tu % automáticamente
```

---

## 🛠️ COMANDOS PARA ARRANCAR

```bash
# 1. Crear proyecto
npx create-next-app@latest booking-saas \
  --typescript --tailwind --app --src-dir

# 2. Dependencias esenciales
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs
npm install stripe @stripe/stripe-js @stripe/react-stripe-js
npm install lucide-react date-fns zod react-hook-form @hookform/resolvers
npm install clsx tailwind-merge   # utilidades CSS

# 3. Componentes UI (gratis, open-source)
npx shadcn-ui@latest init
npx shadcn-ui@latest add button card input calendar badge

# 4. Variables de entorno (.env.local)
NEXT_PUBLIC_APP_DOMAIN=tunegocio.com
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=pk_live_...
META_WHATSAPP_TOKEN=EAAx...
META_PHONE_NUMBER_ID=1234567890
NEXT_PUBLIC_APP_URL=https://tunegocio.com
```

---

## 🔐 SEGURIDAD ESENCIAL

```
✅ RLS en Supabase — tenants NUNCA ven datos de otros
✅ JWT con tenant_id — validar en CADA query del backend
✅ Stripe Elements — datos de tarjeta NUNCA en tu servidor
✅ Webhooks con firma — verificar cada evento Stripe
✅ Rate limiting — máx. 10 intentos de reserva por IP/hora
✅ HTTPS obligatorio — en todos los subdominios
✅ Validar tenant activo — verificar plan vigente en cada request
```

---

## 📌 REGLAS DE ORO

```
1. MOBILE FIRST — el cliente reserva desde el celular. Diseña en 390px
2. 3 CLICS MÁXIMO — del home a elegir hora disponible
3. MULTI-TENANT DESDE EL DÍA 1 — agregarlo después cuesta semanas
4. CSS VARIABLES = WHITE-LABEL — un cambio = marca nueva, sin tocar código
5. STRIPE ELEMENTS — datos de tarjeta NUNCA tocan tu servidor
6. WHATSAPP SIEMPRE — en LATAM WhatsApp > todo lo demás
7. CARGA < 2 SEGUNDOS — el cliente abandona si es lento
8. ANTICIPO OBLIGATORIO — sin pago no hay cita, fin de los no-shows
9. RLS EN SUPABASE — seguridad de tenants desde el primer día
10. SUPABASE > FIREBASE — SQL + RLS + open source = ganador para SaaS
```

---

*Stack: Next.js 14 (= React con superpoderes) + Supabase + Stripe/Wompi + WhatsApp*
*Aplica para: Barberías · Salones de belleza · Spas · Nail studios · Tatuadores*
*Guatemala → LATAM | Escalable desde $0/mes de infraestructura*
