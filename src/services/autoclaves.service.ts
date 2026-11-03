import axios from 'axios'
import authHeader from './auth-header'
import { env } from '@/lib/env'
import type { EstadoAutoclave, PuntoTelemetria, ReporteLote } from '@/types/autoclaves'

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
