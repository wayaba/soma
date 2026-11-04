export interface FaseItem {
  faseNum: number
  inicio: string
  fin: string | null
  duracionSeg?: number | null
}

export interface Lote {
  _id: string
  autoclaveId: number
  lote: string
  recetaId: number
  estado: number
  faseActual: number
  timestampInicio: string
  timestampFin: string | null
  fases: FaseItem[]
}

export interface PuntoTelemetria {
  timestamp: string
  meta?: { autoclaveId: number; loteId: string | null }
  temp1?: number
  temp2?: number
  presion?: number
  fase?: number
}

export interface ReferenciaFase { _id: number; faseNum: number; nombre: string; activo: boolean }
export interface ReferenciaEstado { _id: number; estadoId: number; codigo: string; nombre: string; descripcion: string; color: string }
export interface ReferenciaMaquina { _id: number; autoclaveId: number; codigo: string; nombre: string; descripcion: string; activo: boolean }
export interface ReferenciasAutoclaves {
  fases: ReferenciaFase[]
  estados: ReferenciaEstado[]
  maquinas: ReferenciaMaquina[]
}

export interface FiltrosLotes {
  autoclaveId?: number
  estado?: number
  desde?: string
  hasta?: string
  lote?: string
  limit?: number
}

export interface MetricasLote {
  tempMaxCamara?: number
  tempMinMeseta?: number
  presionMax?: number
  muestrasTotal?: number
}

export interface ReporteLote {
  cabecera: Lote
  fases: FaseItem[]
  metricas: MetricasLote
}

export interface EstadoAutoclave {
  lotesActivos: Lote[]
  telemetriaActual: Array<(PuntoTelemetria & { meta: { autoclaveId: number; loteId: string | null } }) | null>
}

export const FASES: Record<number, string> = {
  0: 'Detenido',
  1: 'Vacío',
  2: 'Vapor',
  3: 'Calentando',
  4: 'Esterilizando',
  5: 'Descargando',
  6: 'Secando',
  7: 'Aireando',
  8: 'Finalizando',
}

export const ESTADOS: Record<number, { label: string; className: string }> = {
  0: { label: 'Detenido', className: 'bg-slate-100 text-slate-600' },
  1: { label: 'En curso', className: 'bg-blue-100 text-blue-700' },
  2: { label: 'Completado', className: 'bg-emerald-100 text-emerald-700' },
  3: { label: 'Abortado', className: 'bg-red-100 text-red-700' },
}
