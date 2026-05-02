# Estado del Proyecto — SaaS de Reservas para Barberías y Salones

> App multi-tenant de citas para barberías, salones de belleza y spas.
> Todos los planes son de pago. Sin planes gratuitos.

---

## Stack Tecnológico

| Capa | Tecnología |
|---|---|
| Framework | Next.js 15 (App Router) |
| Lenguaje | TypeScript 5.6 |
| Base de datos | Supabase (PostgreSQL) |
| Autenticación | Supabase Auth |
| Estilos | Tailwind CSS 3.4 |
| Animaciones | Framer Motion |
| Validación | Zod + React Hook Form |
| Fechas/Zonas horarias | date-fns + date-fns-tz |
| Notificaciones | WhatsApp Business API (Meta) |
| Deploy sugerido | Vercel |

---

## Planes (Todos de Pago — Sin Plan Gratuito)

> Los precios sugeridos están en Quetzales (Q) pensados para el mercado guatemalteco/LATAM.

| Plan | Precio sugerido/mes | A quién va dirigido |
|---|---|---|
| **Básico** | Q149/mes | Barbería o salón pequeño, 1–2 empleados |
| **Pro** | Q299/mes | Negocio mediano, hasta 5 empleados, más funciones |
| **Elite** | Q499/mes | Cadenas, múltiples empleados, analytics, soporte prioritario |

> Los precios exactos los defines tú. Esto es una referencia de posicionamiento.

---

## Qué Llevamos Construido

### Infraestructura base
- [x] Arquitectura multi-tenant con aislamiento completo por RLS (Row Level Security)
- [x] Sistema de routing por slug: `/b/barberia-lopez` para cada negocio
- [x] Inyección de tema (colores, logo, fuente) por CSS variables sin parpadeo
- [x] Middleware de autenticación y protección de rutas
- [x] Esquema completo de base de datos con triggers y políticas de seguridad

### Autenticación
- [x] Login con email/contraseña (Supabase Auth)
- [x] Registro de negocio: selector de tipo + datos del dueño → crea tenant automáticamente

### Dashboard (panel del negocio)
- [x] Layout con sidebar de navegación
- [x] Página principal con estadísticas del día (citas, ingresos, pendientes, no-shows)
- [x] Módulo de citas: lista con filtros y cambio de estado
- [x] Módulo de servicios: agregar, editar, eliminar (con duración, precio, depósito)
- [x] Módulo de empleados: agregar, editar, eliminar con rol y especialidad
- [x] Configuración general: zona horaria, anticipación mínima, días máximos, intervalo de slots
- [x] Editor de branding: colores, logo, imagen de portada, mensaje de bienvenida

### Flujo de reserva pública (`/b/[tenant]`)
- [x] Página de perfil del negocio con servicios y empleados
- [x] Asistente de reserva en 5 pasos: servicio → empleado → fecha/hora → datos del cliente → resumen
- [x] Página de confirmación
- [x] Calculador de disponibilidad (maneja horarios por empleado, descansos, citas existentes, bloqueos)

### API
- [x] CRUD completo de citas (`/api/appointments`)
- [x] Endpoint de disponibilidad (`/api/availability`)
- [x] Gestión de tenants (`/api/tenants`)
- [x] Schedules de empleados (`/api/staff/schedules`)
- [x] Webhook de WhatsApp (`/api/notifications/whatsapp`)

---

## Qué Falta (Para Lanzar MVP)

### Crítico — Sin esto no se puede lanzar

1. **Subida de imágenes a Supabase Storage**
   - Logo y portada del negocio no tienen endpoint de upload funcional
   - El editor de branding ya tiene la UI pero falta conectar la subida

2. **Acciones completas en citas**
   - Confirmar, completar, cancelar con motivo, reagendar — flujos no terminados
   - `AppointmentActions.tsx` existe pero incompleto

3. **Gestión de horarios del empleado (UI)**
   - La API existe pero no hay interfaz para que el dueño configure los horarios semanales de cada empleado

4. **Cobro de depósitos / pagos**
   - La base de datos ya tiene campos `deposit_amount`, `deposit_paid`, `balance_due`
   - Falta integrar Stripe o Wompi para cobrar depósitos al reservar

5. **Envío real de notificaciones WhatsApp**
   - El cliente y las plantillas están en `/lib/whatsapp/`
   - Falta conectar el número de WhatsApp Business y disparar las notificaciones

### Importante — Antes de escalar

6. **Notificaciones por email** — No hay proveedor integrado (Resend o Sendgrid recomendado)
7. **CRM básico de clientes** — La tabla `clients` guarda historial pero no hay página para verlo
8. **Gestión de suscripciones** — No hay lógica de trial enforcement ni upgrade/downgrade de plan
9. **Invitar empleados al dashboard** — Los empleados pueden estar en la DB pero no hay flujo para darles acceso

### Futuro (Post-lanzamiento)

- Vista de calendario visual para el dashboard
- Analytics de ingresos y rendimiento por empleado
- Reseñas de clientes
- Exportación de reportes (CSV/PDF)
- Integración con Google Calendar
- App móvil

---

## Respuestas a Tus Dudas

---

### 1. ¿Tengo que comprar otro dominio?

**Sí, te conviene comprar uno separado.**

Este SaaS es un producto propio que vas a vender a negocios. Necesita identidad propia para que las barberías confíen en él. Ejemplos de dominios:

| Opción | Ejemplo | Precio aprox. |
|---|---|---|
| `.com` | `agendapro.com`, `citasapp.com` | ~$12/año |
| `.app` | `miagenda.app`, `bookzy.app` | ~$20/año |
| `.gt` (Guatemala) | `agendagt.gt` | ~$30–40/año |
| `.io` | `agendaio.io` | ~$35/año |

**Recomendación:** busca un `.com` disponible. Es lo más universal, lo más barato y lo que más confianza genera en LATAM. Namecheap o Porkbun son los más baratos (~$8–12/año en oferta).

---

### 2. ¿Puedo usar finbalo.com?

**No lo uses para este SaaS directamente** — pero sí puedes enlazarlos.

Tu situación:
- `finbalo.com` → página principal de tu startup (lo que hacen, quiénes son)
- `[nuevo-dominio].com` → el SaaS de reservas (producto independiente)

Lo que SÍ puedes hacer con finbalo.com:
- Agregar una sección "Nuestros productos" y poner un link al SaaS
- Usar `agenda.finbalo.com` como subdominio mientras pruebas (sin costo extra)
- Pero para lanzar en serio, el producto debe tener su propio dominio

Por qué mantenerlos separados:
- Si el SaaS crece, puedes venderlo o conseguir inversión sin que esté atado a finbalo
- Los clientes (barberías) no necesitan saber que es de Finbalo
- Más profesional y enfocado

---

### 3. ¿Cómo hago algo escalable y barato que cualquier barbería pueda pagar?

**La buena noticia: ya elegiste el stack correcto.**

#### Costos de infraestructura estimados

| Servicio | Plan | Costo/mes | Para qué sirve |
|---|---|---|---|
| **Vercel** | Hobby (dev) → Pro cuando lances | $0 → $20 | Hosting del Next.js |
| **Supabase** | Free → Pro cuando crezcas | $0 → $25 | Base de datos + Auth + Storage |
| **Dominio** | — | ~$1/mes (anualizado) | Tu dominio |
| **WhatsApp Business API** | Meta — pago por conversación | ~$0.005–0.02/mensaje | Notificaciones |
| **Resend** (email) | Free hasta 3,000/mes | $0 → $20 | Confirmaciones por email |
| **Total inicial** | | **~$0–$1/mes** | Solo tu dominio |
| **Total con clientes reales** | | **~$46–$66/mes** | Con Vercel Pro + Supabase Pro |

#### ¿Qué significa esto para ti?

Con **solo 1 cliente en plan Básico (Q149/mes ≈ $19/mes)** ya casi cubres los costos iniciales.

Con **3 clientes en plan Básico** ya pagas toda la infraestructura y empiezas a ganar.

#### Estrategia de escalabilidad sin gastar de más

1. **Empieza en los tiers gratuitos** (Supabase Free + Vercel Hobby) mientras desarrollas y tienes tus primeros 2–3 clientes de prueba.

2. **Sube a tier de pago cuando tengas 5+ clientes activos pagando.** Para ese momento ya generas suficiente para cubrirlo.

3. **Supabase escala automáticamente** — no tienes que migrar de base de datos conforme creces, solo subes de plan.

4. **Multi-tenant en una sola app** — no necesitas un servidor por barbería. 100 barberías = misma instancia, mismos costos fijos. Eso es el poder de este arquitectura.

5. **Evita servicios caros innecesarios** — no necesitas Twilio SMS si WhatsApp funciona bien en LATAM. No necesitas AWS desde el inicio.

#### Para que las barberías puedan pagarlo

El precio de Q149–499/mes es alcanzable para cualquier barbería que trabaje con citas. Una barbería con 3 empleados que atiende 5 clientes/día genera Q750–1500/día. Tu plan más barato es menos del 10% de sus ingresos semanales.

Lo que las hará pagar (no solo el precio):
- Que el flujo de reservas funcione sin fallas
- Que los recordatorios por WhatsApp reduzcan los no-shows (eso les ahorra dinero real)
- Que el setup sea simple — menos de 30 minutos para estar operativo

---

## Estructura de Archivos Clave

```
/app
├── page.tsx                    Landing page con precios
├── (auth)/login                Login
├── (auth)/register             Registro de negocio
├── (dashboard)/dashboard/      Panel del negocio
│   ├── appointments/           Lista de citas
│   ├── services/               Servicios
│   ├── staff/                  Empleados
│   └── settings/               Config general + branding
└── b/[tenant]/                 Páginas públicas de reserva
    ├── page.tsx                Perfil del negocio
    ├── book/                   Asistente de reserva
    └── confirmation/           Confirmación

/lib
├── availability/calculator.ts  Motor de disponibilidad
├── tenant/resolver.ts          Resolver de tenant por slug
├── tenant/theme.ts             Generador de CSS variables
└── whatsapp/                   Integración WhatsApp

/database
├── schema.sql                  Esquema completo con RLS
└── seed.sql                    Datos de prueba
```

---

*Última actualización: Mayo 2026*
