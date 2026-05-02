import type { Tenant } from '@/types/database'

export function generateThemeCSS(tenant: Tenant): string {
  return `
    :root {
      --color-primary: ${tenant.primary_color};
      --color-secondary: ${tenant.secondary_color};
      --color-bg: ${tenant.bg_color};
      --color-text: ${tenant.text_color};
      --border-radius: ${tenant.border_radius}px;
      --font-main: '${tenant.font}', Inter, sans-serif;
    }
  `
}

export function contrastColor(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luminance > 0.5 ? '#111111' : '#ffffff'
}
