-- ============================================================
-- DATOS DE PRUEBA — ejecutar DESPUÉS del schema.sql
-- ============================================================

-- Tenant de demo
INSERT INTO tenants (slug, name, business_type, primary_color, secondary_color,
  welcome_message, phone, whatsapp, address, city, plan)
VALUES (
  'demo-barberia',
  'Barbería Don Carlos',
  'barbershop',
  '#1a1a2e',
  '#e94560',
  'Bienvenido a Barbería Don Carlos. Reserva tu cita en segundos.',
  '+502 5555-1234',
  '+502 5555-1234',
  '4a Calle 10-50, Zona 1',
  'Ciudad de Guatemala',
  'pro'
);

-- Staff del tenant de demo
INSERT INTO staff (tenant_id, name, specialty, bio, sort_order)
SELECT
  t.id,
  'Carlos Mendoza',
  'Fades y degradados',
  'Barbero con 8 años de experiencia. Especialista en fades.',
  1
FROM tenants t WHERE t.slug = 'demo-barberia';

INSERT INTO staff (tenant_id, name, specialty, bio, sort_order)
SELECT
  t.id,
  'Miguel Pérez',
  'Cortes clásicos y barba',
  'Barbero clásico, experto en cortes tradicionales y arreglo de barba.',
  2
FROM tenants t WHERE t.slug = 'demo-barberia';

-- Servicios del tenant de demo
INSERT INTO services (tenant_id, name, category, duration_min, price, sort_order)
SELECT t.id, 'Corte clásico',    'haircut', 30, 50.00, 1 FROM tenants t WHERE t.slug = 'demo-barberia';
INSERT INTO services (tenant_id, name, category, duration_min, price, sort_order)
SELECT t.id, 'Barba completa',   'beard',   20, 40.00, 2 FROM tenants t WHERE t.slug = 'demo-barberia';
INSERT INTO services (tenant_id, name, category, duration_min, price, sort_order)
SELECT t.id, 'Corte + Barba',    'haircut', 50, 80.00, 3 FROM tenants t WHERE t.slug = 'demo-barberia';
INSERT INTO services (tenant_id, name, category, duration_min, price, sort_order)
SELECT t.id, 'Fade / Degradado', 'haircut', 40, 65.00, 4 FROM tenants t WHERE t.slug = 'demo-barberia';

-- Horarios (Lun-Sab, 8am-7pm)
INSERT INTO schedules (staff_id, tenant_id, day_of_week, start_time, end_time, is_working, break_start, break_end)
SELECT s.id, s.tenant_id, d.day, '08:00', '19:00', d.day != 0, '13:00', '14:00'
FROM staff s
CROSS JOIN (VALUES (0),(1),(2),(3),(4),(5),(6)) AS d(day)
WHERE s.name IN ('Carlos Mendoza', 'Miguel Pérez');

-- Asociar todos los servicios a todos los barberos
INSERT INTO staff_services (staff_id, service_id)
SELECT s.id, sv.id
FROM staff s
CROSS JOIN services sv
WHERE s.tenant_id = sv.tenant_id
ON CONFLICT DO NOTHING;
