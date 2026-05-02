-- ============================================================
-- AGENDA SAAS — SCHEMA COMPLETO
-- Ejecutar en Supabase SQL Editor (en orden)
-- ============================================================

-- ─── TENANTS ──────────────────────────────────────────────────────────────────
-- Cada negocio que paga membresía (barbería, salón, spa, etc.)
CREATE TABLE IF NOT EXISTS tenants (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug                TEXT UNIQUE NOT NULL,
  name                TEXT NOT NULL,
  business_type       TEXT DEFAULT 'general',   -- barbershop | salon | spa | nail | tattoo | general
  plan                TEXT DEFAULT 'basic' CHECK (plan IN ('basic','pro','elite')),

  -- White-label
  primary_color       TEXT DEFAULT '#1a1a2e',
  secondary_color     TEXT DEFAULT '#e94560',
  bg_color            TEXT DEFAULT '#ffffff',
  text_color          TEXT DEFAULT '#111111',
  border_radius       INTEGER DEFAULT 8,
  logo_url            TEXT,
  cover_url           TEXT,
  welcome_message     TEXT,
  font                TEXT DEFAULT 'Inter',

  -- Configuración de citas
  deposit_percent     INTEGER DEFAULT 0 CHECK (deposit_percent BETWEEN 0 AND 100),
  cancel_hours        INTEGER DEFAULT 24,
  min_advance_hours   INTEGER DEFAULT 1,
  max_advance_days    INTEGER DEFAULT 30,
  slot_interval_min   INTEGER DEFAULT 30,       -- intervalo entre slots (30 o 60 min)

  -- Datos del negocio
  phone               TEXT,
  whatsapp            TEXT,
  address             TEXT,
  city                TEXT,
  country             TEXT DEFAULT 'GT',
  timezone            TEXT DEFAULT 'America/Guatemala',
  instagram           TEXT,
  facebook            TEXT,

  -- Control
  owner_id            UUID REFERENCES auth.users(id),
  is_active           BOOLEAN DEFAULT true,
  trial_ends_at       TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '14 days'),
  subscription_id     TEXT,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ─── STAFF ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS staff (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id     UUID REFERENCES auth.users(id),
  name        TEXT NOT NULL,
  role        TEXT DEFAULT 'staff' CHECK (role IN ('owner','manager','staff')),
  avatar_url  TEXT,
  bio         TEXT,
  specialty   TEXT,
  is_active   BOOLEAN DEFAULT true,
  sort_order  INTEGER DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─── SERVICES ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS services (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id        UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name             TEXT NOT NULL,
  description      TEXT,
  category         TEXT DEFAULT 'general',   -- haircut | beard | color | nails | wax | treatment | general
  duration_min     INTEGER NOT NULL CHECK (duration_min > 0),
  price            DECIMAL(10,2) NOT NULL CHECK (price >= 0),
  deposit_amount   DECIMAL(10,2),            -- NULL = usa % del tenant
  requires_deposit BOOLEAN DEFAULT false,
  is_active        BOOLEAN DEFAULT true,
  sort_order       INTEGER DEFAULT 0,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ─── STAFF_SERVICES ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS staff_services (
  staff_id    UUID REFERENCES staff(id) ON DELETE CASCADE,
  service_id  UUID REFERENCES services(id) ON DELETE CASCADE,
  PRIMARY KEY (staff_id, service_id)
);

-- ─── SCHEDULES ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS schedules (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id      UUID NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
  tenant_id     UUID NOT NULL REFERENCES tenants(id),
  day_of_week   INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Dom
  start_time    TIME NOT NULL DEFAULT '08:00',
  end_time      TIME NOT NULL DEFAULT '18:00',
  is_working    BOOLEAN DEFAULT true,
  break_start   TIME,
  break_end     TIME,
  UNIQUE (staff_id, day_of_week)
);

-- ─── BLOCKED_TIMES ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS blocked_times (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id    UUID REFERENCES staff(id) ON DELETE CASCADE,
  tenant_id   UUID NOT NULL REFERENCES tenants(id),
  start_at    TIMESTAMPTZ NOT NULL,
  end_at      TIMESTAMPTZ NOT NULL,
  reason      TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─── CLIENTS ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS clients (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  phone         TEXT,
  email         TEXT,
  notes         TEXT,
  total_visits  INTEGER DEFAULT 0,
  total_spent   DECIMAL(10,2) DEFAULT 0,
  no_shows      INTEGER DEFAULT 0,
  last_visit    TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (tenant_id, phone)
);

-- ─── APPOINTMENTS ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS appointments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  staff_id        UUID NOT NULL REFERENCES staff(id),
  service_id      UUID NOT NULL REFERENCES services(id),
  client_id       UUID REFERENCES clients(id),

  starts_at       TIMESTAMPTZ NOT NULL,
  ends_at         TIMESTAMPTZ NOT NULL,

  status          TEXT DEFAULT 'confirmed' CHECK (status IN (
                    'pending','confirmed','completed','cancelled','no_show'
                  )),

  price_total     DECIMAL(10,2) NOT NULL,
  deposit_amount  DECIMAL(10,2) DEFAULT 0,
  deposit_paid    BOOLEAN DEFAULT false,
  balance_due     DECIMAL(10,2),

  client_notes    TEXT,
  staff_notes     TEXT,

  cancelled_at    TIMESTAMPTZ,
  cancel_reason   TEXT,
  cancelled_by    TEXT,

  source          TEXT DEFAULT 'online',    -- online | manual | walkin
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─── NOTIFICATIONS ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id  UUID REFERENCES appointments(id),
  tenant_id       UUID NOT NULL REFERENCES tenants(id),
  type            TEXT CHECK (type IN (
                    'confirmation','reminder_24h','reminder_2h',
                    'cancellation','no_show_alert'
                  )),
  channel         TEXT DEFAULT 'whatsapp' CHECK (channel IN ('whatsapp','email')),
  status          TEXT DEFAULT 'pending' CHECK (status IN ('pending','sent','failed')),
  error_msg       TEXT,
  sent_at         TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─── INDEXES ──────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_appointments_tenant_date
  ON appointments (tenant_id, starts_at);
CREATE INDEX IF NOT EXISTS idx_appointments_staff_date
  ON appointments (staff_id, starts_at);
CREATE INDEX IF NOT EXISTS idx_appointments_status
  ON appointments (tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_staff_tenant
  ON staff (tenant_id);
CREATE INDEX IF NOT EXISTS idx_services_tenant
  ON services (tenant_id);
CREATE INDEX IF NOT EXISTS idx_schedules_staff
  ON schedules (staff_id);
CREATE INDEX IF NOT EXISTS idx_clients_tenant
  ON clients (tenant_id);

-- ─── TRIGGER: updated_at ──────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at_tenants
  BEFORE UPDATE ON tenants
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER set_updated_at_appointments
  BEFORE UPDATE ON appointments
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- ─── TRIGGER: actualizar stats de cliente ─────────────────────────────────────
CREATE OR REPLACE FUNCTION update_client_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE clients SET
      total_visits = total_visits + 1,
      total_spent  = total_spent + NEW.price_total,
      last_visit   = NEW.starts_at
    WHERE id = NEW.client_id;
  END IF;
  IF NEW.status = 'no_show' AND OLD.status != 'no_show' THEN
    UPDATE clients SET no_shows = no_shows + 1 WHERE id = NEW.client_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_appointment_status_change
  AFTER UPDATE ON appointments
  FOR EACH ROW EXECUTE FUNCTION update_client_stats();

-- ─── ROW LEVEL SECURITY ───────────────────────────────────────────────────────
ALTER TABLE tenants      ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff        ENABLE ROW LEVEL SECURITY;
ALTER TABLE services     ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedules    ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocked_times ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients      ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_services ENABLE ROW LEVEL SECURITY;

-- Helper: obtener tenant_id del usuario autenticado
CREATE OR REPLACE FUNCTION my_tenant_id()
RETURNS UUID AS $$
  SELECT tenant_id FROM staff WHERE user_id = auth.uid() LIMIT 1
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Tenants: el owner puede leer/editar el suyo
CREATE POLICY "tenants_owner" ON tenants
  USING (owner_id = auth.uid());

-- Staff: solo ven staff del mismo tenant
CREATE POLICY "staff_tenant_isolation" ON staff
  USING (tenant_id = my_tenant_id());

CREATE POLICY "services_tenant_isolation" ON services
  USING (tenant_id = my_tenant_id());

CREATE POLICY "schedules_tenant_isolation" ON schedules
  USING (tenant_id = my_tenant_id());

CREATE POLICY "blocked_tenant_isolation" ON blocked_times
  USING (tenant_id = my_tenant_id());

CREATE POLICY "clients_tenant_isolation" ON clients
  USING (tenant_id = my_tenant_id());

CREATE POLICY "appointments_tenant_isolation" ON appointments
  USING (tenant_id = my_tenant_id());

CREATE POLICY "notifications_tenant_isolation" ON notifications
  USING (tenant_id = my_tenant_id());

-- Lectura pública para el flujo de reserva (sin auth)
CREATE POLICY "public_read_tenants" ON tenants
  FOR SELECT USING (is_active = true);

CREATE POLICY "public_read_staff" ON staff
  FOR SELECT USING (is_active = true);

CREATE POLICY "public_read_services" ON services
  FOR SELECT USING (is_active = true);

CREATE POLICY "public_read_schedules" ON schedules
  FOR SELECT USING (true);

CREATE POLICY "public_read_blocked" ON blocked_times
  FOR SELECT USING (true);

-- Insertar cita pública (cliente que reserva, sin auth)
CREATE POLICY "public_insert_appointments" ON appointments
  FOR INSERT WITH CHECK (true);

CREATE POLICY "public_insert_clients" ON clients
  FOR INSERT WITH CHECK (true);
