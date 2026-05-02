export type BusinessType = 'barbershop' | 'salon' | 'spa' | 'nail' | 'tattoo' | 'general'
export type Plan = 'basic' | 'pro' | 'elite'
export type AppointmentStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show'
export type NotificationType = 'confirmation' | 'reminder_24h' | 'reminder_2h' | 'cancellation' | 'no_show_alert'
export type StaffRole = 'owner' | 'manager' | 'staff'

export interface Tenant {
  id: string
  slug: string
  name: string
  business_type: BusinessType
  plan: Plan
  primary_color: string
  secondary_color: string
  bg_color: string
  text_color: string
  border_radius: number
  logo_url: string | null
  cover_url: string | null
  welcome_message: string | null
  font: string
  deposit_percent: number
  cancel_hours: number
  min_advance_hours: number
  max_advance_days: number
  slot_interval_min: number
  phone: string | null
  whatsapp: string | null
  address: string | null
  city: string | null
  country: string
  timezone: string
  instagram: string | null
  facebook: string | null
  owner_id: string | null
  is_active: boolean
  trial_ends_at: string | null
  subscription_id: string | null
  created_at: string
  updated_at: string
}

export interface Staff {
  id: string
  tenant_id: string
  user_id: string | null
  name: string
  role: StaffRole
  avatar_url: string | null
  bio: string | null
  specialty: string | null
  is_active: boolean
  sort_order: number
  created_at: string
}

export interface Service {
  id: string
  tenant_id: string
  name: string
  description: string | null
  category: string
  duration_min: number
  price: number
  deposit_amount: number | null
  requires_deposit: boolean
  is_active: boolean
  sort_order: number
  created_at: string
}

export interface Schedule {
  id: string
  staff_id: string
  tenant_id: string
  day_of_week: number
  start_time: string
  end_time: string
  is_working: boolean
  break_start: string | null
  break_end: string | null
}

export interface BlockedTime {
  id: string
  staff_id: string | null
  tenant_id: string
  start_at: string
  end_at: string
  reason: string | null
  created_at: string
}

export interface Client {
  id: string
  tenant_id: string
  name: string
  phone: string | null
  email: string | null
  notes: string | null
  total_visits: number
  total_spent: number
  no_shows: number
  last_visit: string | null
  created_at: string
}

export interface Appointment {
  id: string
  tenant_id: string
  staff_id: string
  service_id: string
  client_id: string | null
  starts_at: string
  ends_at: string
  status: AppointmentStatus
  price_total: number
  deposit_amount: number
  deposit_paid: boolean
  balance_due: number | null
  client_notes: string | null
  staff_notes: string | null
  cancelled_at: string | null
  cancel_reason: string | null
  cancelled_by: string | null
  source: string
  created_at: string
  updated_at: string
  // joins
  staff?: Staff
  service?: Service
  client?: Client
}

export interface Notification {
  id: string
  appointment_id: string | null
  tenant_id: string
  type: NotificationType
  channel: 'whatsapp' | 'email'
  status: 'pending' | 'sent' | 'failed'
  error_msg: string | null
  sent_at: string | null
  created_at: string
}

// Input types para crear/actualizar
export interface CreateAppointmentInput {
  tenant_id: string
  staff_id: string
  service_id: string
  starts_at: string
  ends_at: string
  price_total: number
  deposit_amount?: number
  client_name: string
  client_phone: string
  client_notes?: string
  source?: string
}

export interface CreateTenantInput {
  slug: string
  name: string
  business_type: BusinessType
  owner_email: string
  owner_password: string
  owner_name: string
}
