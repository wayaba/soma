import axios from 'axios'
import authHeader from './auth-header'
import { env } from '@/lib/env'
import type { EstadoAutoclave, FiltrosLotes, Lote, PuntoTelemetria, ReferenciasAutoclaves, ReporteLote } from '@/types/autoclaves'

const api = axios.create({ baseURL: env.BACKEND_URI })

export const getCurvaLote = async (loteId: string) => {
  const { data } = await api.get<PuntoTelemetria[]>(`/api/lotes/${encodeURIComponent(loteId)}/curva`, {
    headers: authHeader(),
  })
  return data
}

export const getReporteLote = async (loteId: string) => {
  const { data } = await api.get<ReporteLote>(`/api/lotes/${encodeURIComponent(loteId)}/reporte`, {
    headers: authHeader(),
  })
  return data
}

export const getEstadoAutoclaves = async () => {
  const { data } = await api.get<EstadoAutoclave>('/api/autoclaves/estado-actual', {
    headers: authHeader(),
  })
  return data
}

export const getLotes = async (filters: FiltrosLotes = {}) => {
  const { data } = await api.get<Lote[]>('/api/lotes', {
    headers: authHeader(),
    params: filters,
  })
  return data
}

export const getReferenciasAutoclaves = async () => {
  const { data } = await api.get<ReferenciasAutoclaves>('/api/autoclaves/referencias', {
    headers: authHeader(),
  })
  return data
}
