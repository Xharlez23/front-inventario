import { EstadoReparacion } from '../../core/models/models'

export const ESTADOS: { value: EstadoReparacion; label: string; color: string }[] = [
  { value: 'recibido', label: 'Recibido', color: '#6b7280' },
  { value: 'diagnostico', label: 'En diagnóstico', color: '#2563eb' },
  { value: 'en_proceso', label: 'En proceso', color: '#d97706' },
  { value: 'esperando_repuesto', label: 'Esperando repuesto', color: '#7c3aed' },
  { value: 'listo', label: 'Listo', color: '#059669' },
  { value: 'entregado', label: 'Entregado', color: '#0D1B3E' },
  { value: 'cancelado', label: 'Cancelado', color: '#dc2626' },
]

export const estadoInfo = (v: string) => ESTADOS.find((e) => e.value === v) ?? ESTADOS[0]

export const fmtMoneda = (n: number | null | undefined) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n ?? 0)
