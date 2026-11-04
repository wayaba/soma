import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import axios from 'axios'
import AutoclaveCurve from '@/components/report/AutoclaveCurve'
import { getCurvaLote, getEstadoAutoclaves, getLotes, getReferenciasAutoclaves, getReporteLote } from '@/services/autoclaves.service'
import { ESTADOS, FASES } from '@/types/autoclaves'
import type { EstadoAutoclave, Lote, PuntoTelemetria, ReferenciasAutoclaves, ReporteLote } from '@/types/autoclaves'

function formatDate(value: string | null | undefined) {
  if (!value) return 'En curso'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return new Intl.DateTimeFormat('es-AR', {
    dateStyle: 'short', timeStyle: 'medium', timeZone: 'America/Argentina/Buenos_Aires',
  }).format(date)
}

function formatDuration(seconds: number | null | undefined) {
  if (seconds == null || seconds < 0) return 'En curso'
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const rest = seconds % 60
  return [hours > 0 ? `${hours} h` : '', minutes > 0 ? `${minutes} min` : '', `${rest} s`].filter(Boolean).join(' ')
}

function errorMessage(error: unknown) {
  if (axios.isAxiosError(error) && error.response?.status === 404) return 'No encontramos ese lote. Revisá el código e intentá nuevamente.'
  if (axios.isAxiosError(error) && error.response?.status === 401) return 'Tu sesión expiró. Volvé a iniciar sesión para consultar el reporte.'
  return 'No se pudo cargar el reporte. Comprobá que el backend esté disponible y volvé a intentar.'
}

export default function AutoclaveReport() {
  const { loteId: routeLoteId } = useParams()
  const navigate = useNavigate()
  const isDetailRoute = Boolean(routeLoteId)
  const [input, setInput] = useState(routeLoteId ?? '')
  const [reporte, setReporte] = useState<ReporteLote | null>(null)
  const [puntos, setPuntos] = useState<PuntoTelemetria[]>([])
  const [estado, setEstado] = useState<EstadoAutoclave | null>(null)
  const [lotes, setLotes] = useState<Lote[]>([])
  const [referencias, setReferencias] = useState<ReferenciasAutoclaves | null>(null)
  const [lotesLoading, setLotesLoading] = useState(true)
  const [lotesError, setLotesError] = useState('')
  const [filterAutoclave, setFilterAutoclave] = useState('')
  const [filterEstado, setFilterEstado] = useState('')
  const [filterDesde, setFilterDesde] = useState('')
  const [filterHasta, setFilterHasta] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingEstado, setLoadingEstado] = useState(true)
  const [error, setError] = useState('')
  const [curveError, setCurveError] = useState('')

  const loadLotes = async (filters: { autoclaveId?: number; estado?: number; desde?: string; hasta?: string }) => {
    setLotesLoading(true)
    setLotesError('')
    try {
      setLotes(await getLotes({ ...filters, limit: 100 }))
    } catch (requestError) {
      setLotesError(errorMessage(requestError))
    } finally {
      setLotesLoading(false)
    }
  }

  const loadReport = async (loteId: string) => {
    setLoading(true)
    setError('')
    setCurveError('')
    setReporte(null)
    setPuntos([])
    try {
      const reportData = await getReporteLote(loteId)
      setReporte(reportData)
      try {
        setPuntos(await getCurvaLote(loteId))
      } catch {
        setCurveError('El resumen del lote está disponible, pero no se pudo cargar la telemetría.')
      }
    } catch (requestError) {
      setError(errorMessage(requestError))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (routeLoteId) return
    let cancelled = false
    getEstadoAutoclaves()
      .then((data) => { if (!cancelled) setEstado(data) })
      .catch(() => { if (!cancelled) setEstado(null) })
      .finally(() => { if (!cancelled) setLoadingEstado(false) })
    return () => { cancelled = true }
  }, [routeLoteId])

  useEffect(() => {
    if (!routeLoteId) void loadLotes({})
    getReferenciasAutoclaves().then(setReferencias).catch(() => setReferencias(null))
  }, [routeLoteId])

  useEffect(() => {
    setInput(routeLoteId ?? '')
    if (routeLoteId) void loadReport(routeLoteId)
    else {
      setReporte(null)
      setPuntos([])
      setError('')
    }
  }, [routeLoteId])

  const onlineMachines = useMemo(() => {
    const latest = estado?.telemetriaActual ?? []
    return [1, 2].map((id) => {
      const sample = latest.find((point) => point?.meta.autoclaveId === id) ?? null
      const activeBatch = estado?.lotesActivos.find((batch) => batch.autoclaveId === id)
      return { id, sample, activeBatch }
    })
  }, [estado])

  const phaseName = (phase: number | undefined) =>
    referencias?.fases.find((item) => item.faseNum === phase)?.nombre ?? (phase === undefined ? '—' : FASES[phase] ?? `Fase ${phase}`)

  const stateName = (state: number) =>
    referencias?.estados.find((item) => item.estadoId === state)?.nombre ?? ESTADOS[state]?.label ?? `Estado ${state}`

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const loteId = input.trim()
    if (loteId) navigate(`/autoclaves/reportes/${encodeURIComponent(loteId)}`)
  }

  const handleFilterSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    void loadLotes({
      ...(filterAutoclave ? { autoclaveId: Number(filterAutoclave) } : {}),
      ...(filterEstado ? { estado: Number(filterEstado) } : {}),
      ...(filterDesde ? { desde: new Date(`${filterDesde}T00:00:00`).toISOString() } : {}),
      ...(filterHasta ? { hasta: new Date(`${filterHasta}T23:59:59.999`).toISOString() } : {}),
    })
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 text-slate-800 sm:px-6 lg:px-8">
      {isDetailRoute ? (
        <header className="screen-only mb-6 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">SOMA · Reportes</p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950">Reporte de lote</h1>
            <p className="mt-1 text-sm text-slate-600">{routeLoteId}</p>
          </div>
          <button onClick={() => navigate('/autoclaves/reportes')} className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50">← Volver al historial</button>
        </header>
      ) : (
        <header className="screen-only mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="mb-1 text-sm font-semibold uppercase tracking-[0.18em] text-primary">SOMA · Esterilización</p>
            <h1 className="text-3xl font-bold tracking-tight text-slate-950">Reportes de autoclaves</h1>
            <p className="mt-2 text-sm text-slate-600">Consultá el ciclo, sus etapas y las curvas de temperatura y presión.</p>
          </div>
          <form onSubmit={handleSubmit} className="flex w-full gap-2 sm:max-w-lg">
            <label htmlFor="loteId" className="sr-only">Código de lote</label>
            <input id="loteId" value={input} onChange={(event) => setInput(event.target.value)} placeholder="Código de lote" className="min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15" />
            <button disabled={!input.trim() || loading} className="brand-button rounded-lg px-4 py-2.5 text-sm disabled:cursor-not-allowed disabled:opacity-50">{loading ? 'Buscando…' : 'Ver reporte'}</button>
          </form>
        </header>
      )}

      {!isDetailRoute && <section aria-labelledby="estado-title" className="screen-only mb-7">
        <div className="mb-3 flex items-center justify-between">
          <h2 id="estado-title" className="text-lg font-semibold text-slate-900">Estado actual</h2>
          <span className="text-xs text-slate-500">Lectura más reciente por equipo</span>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {onlineMachines.map(({ id, sample, activeBatch }) => (
            <article key={id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Autoclave 0{id}</p>
                  <p className="mt-1 text-lg font-semibold text-slate-900">{activeBatch?.lote ?? sample?.meta.loteId ?? 'Sin lote activo'}</p>
                </div>
                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${activeBatch ? ESTADOS[1].className : 'bg-slate-100 text-slate-600'}`}>{activeBatch ? 'En curso' : sample ? 'En espera' : 'Sin datos'}</span>
              </div>
              <div className="mt-5 grid grid-cols-3 gap-3">
                <Reading label="Temp. cámara" value={sample ? metric(sample.temp1, ' °C', 1) : '—'} />
                <Reading label="Drenaje" value={sample ? metric(sample.temp2, ' °C', 1) : '—'} />
                <Reading label="Presión" value={sample ? metric(sample.presion, ' bar', 2) : '—'} />
              </div>
              <div className="mt-4 flex justify-between border-t border-slate-100 pt-3 text-xs text-slate-500">
                <span>Fase: {sample ? phaseName(sample.fase) : '—'}</span>
                <span>{loadingEstado ? 'Actualizando…' : sample ? formatDate(sample.timestamp) : 'Esperando telemetría'}</span>
              </div>
            </article>
          ))}
        </div>
      </section>}

      {!isDetailRoute && <section aria-labelledby="lotes-title" className="screen-only mb-7 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 id="lotes-title" className="text-lg font-semibold text-slate-950">Historial de ciclos</h2>
            <p className="mt-1 text-sm text-slate-500">Elegí un lote para generar su reporte de proceso.</p>
          </div>
          <span className="text-xs text-slate-500">Últimos 100 resultados</span>
        </div>
        <form onSubmit={handleFilterSubmit} className="mb-5 grid gap-3 rounded-lg bg-slate-50 p-4 sm:grid-cols-2 lg:grid-cols-5">
          <label className="m-0 text-xs font-semibold text-slate-600">Autoclave
            <select value={filterAutoclave} onChange={(event) => setFilterAutoclave(event.target.value)} className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-normal">
              <option value="">Todos</option>
              {(referencias?.maquinas ?? [{ autoclaveId: 1, nombre: 'Autoclave 01' }, { autoclaveId: 2, nombre: 'Autoclave 02' }]).map((machine) => <option key={machine.autoclaveId} value={machine.autoclaveId}>{machine.nombre}</option>)}
            </select>
          </label>
          <label className="m-0 text-xs font-semibold text-slate-600">Estado
            <select value={filterEstado} onChange={(event) => setFilterEstado(event.target.value)} className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-normal">
              <option value="">Todos</option>
              {[1, 2, 3].map((value) => <option key={value} value={value}>{stateName(value)}</option>)}
            </select>
          </label>
          <label className="m-0 text-xs font-semibold text-slate-600">Desde
            <input type="date" value={filterDesde} onChange={(event) => setFilterDesde(event.target.value)} className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-normal" />
          </label>
          <label className="m-0 text-xs font-semibold text-slate-600">Hasta
            <input type="date" value={filterHasta} onChange={(event) => setFilterHasta(event.target.value)} className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-normal" />
          </label>
          <div className="flex items-end gap-2">
            <button className="brand-button w-full px-4 py-2 text-sm">Filtrar</button>
            <button type="button" onClick={() => { setFilterAutoclave(''); setFilterEstado(''); setFilterDesde(''); setFilterHasta(''); void loadLotes({}) }} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700">Limpiar</button>
          </div>
        </form>
        {lotesError && <p role="alert" className="mb-3 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800">{lotesError}</p>}
        {lotesLoading ? <p className="py-8 text-center text-sm text-slate-500">Cargando historial…</p> : lotes.length === 0 ? <p className="py-8 text-center text-sm text-slate-500">No hay lotes con esos filtros.</p> : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-left text-sm">
              <thead className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-3 py-3">Lote</th><th className="px-3 py-3">Autoclave</th><th className="px-3 py-3">Estado</th><th className="px-3 py-3">Inicio</th><th className="px-3 py-3">Fin</th><th className="px-3 py-3 text-right">Reporte</th></tr></thead>
              <tbody className="divide-y divide-slate-100">
                {lotes.map((lote) => <tr key={lote._id} className="hover:bg-slate-50">
                  <td className="px-3 py-3 font-semibold text-slate-900">{lote.lote}</td>
                  <td className="px-3 py-3 text-slate-600">{referencias?.maquinas.find((machine) => machine.autoclaveId === lote.autoclaveId)?.nombre ?? `Autoclave 0${lote.autoclaveId}`}</td>
                  <td className="px-3 py-3"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${ESTADOS[lote.estado]?.className ?? 'bg-slate-100 text-slate-600'}`}>{stateName(lote.estado)}</span></td>
                  <td className="px-3 py-3 text-slate-600">{formatDate(lote.timestampInicio)}</td>
                  <td className="px-3 py-3 text-slate-600">{formatDate(lote.timestampFin)}</td>
                  <td className="px-3 py-3 text-right"><button onClick={() => navigate(`/autoclaves/reportes/${encodeURIComponent(lote.lote)}`)} className="rounded-lg border border-primary/20 bg-primary/5 px-3 py-1.5 text-xs font-bold text-primary hover:bg-primary/10">Ver reporte</button></td>
                </tr>)}
              </tbody>
            </table>
          </div>
        )}
      </section>}

      {error && <div role="alert" className="screen-only mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div>}
      {loading && <div className="screen-only rounded-xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">Cargando reporte del lote…</div>}

      {!isDetailRoute && !loading && !reporte && !error && (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white/80 px-6 py-12 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-xl text-primary" aria-hidden="true">⌕</div>
          <h2 className="text-lg font-semibold text-slate-900">Buscá un lote para ver su reporte</h2>
          <p className="mx-auto mt-2 max-w-lg text-sm text-slate-600">Ingresá el código del lote. El reporte reúne los datos del ciclo, duración de cada fase y las mediciones registradas por los PLC.</p>
        </div>
      )}

      {reporte && (
        <div className="report-print-area space-y-6">
          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="text-2xl font-bold text-slate-950">Lote {reporte.cabecera.lote}</h2>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${ESTADOS[reporte.cabecera.estado]?.className ?? 'bg-slate-100 text-slate-600'}`}>{ESTADOS[reporte.cabecera.estado]?.label ?? `Estado ${reporte.cabecera.estado}`}</span>
                </div>
                <p className="mt-2 text-sm text-slate-500">{referencias?.maquinas.find((machine) => machine.autoclaveId === reporte.cabecera.autoclaveId)?.nombre ?? `Autoclave 0${reporte.cabecera.autoclaveId}`} · Receta {reporte.cabecera.recetaId}</p>
              </div>
              <button onClick={() => window.print()} className="screen-only w-fit rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">Exportar a PDF</button>
            </div>
            <div className="mt-6 grid gap-4 border-t border-slate-100 pt-5 sm:grid-cols-3">
              <Reading label="Inicio del ciclo" value={formatDate(reporte.cabecera.timestampInicio)} />
              <Reading label="Fin del ciclo" value={formatDate(reporte.cabecera.timestampFin)} />
              <Reading label="Fase actual" value={phaseName(reporte.cabecera.faseActual)} />
            </div>
          </section>

          <section aria-label="Métricas del proceso" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Metric label="Temperatura máxima de cámara" value={metric(reporte.metricas.tempMaxCamara, ' °C', 1)} detail="Sensor temp1" />
            <Metric label="Temperatura mínima en meseta" value={metric(reporte.metricas.tempMinMeseta, ' °C', 1)} detail="Fase de esterilización" />
            <Metric label="Presión máxima" value={metric(reporte.metricas.presionMax, ' bar', 2)} detail="Presión de cámara" />
            <Metric label="Muestras registradas" value={reporte.metricas.muestrasTotal?.toLocaleString('es-AR') ?? '—'} detail="Puntos de telemetría" />
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <SectionHeading title="Curva del ciclo" subtitle={`${puntos.length.toLocaleString('es-AR')} muestras · hora local de Argentina`} />
            {curveError && <p role="status" className="mb-3 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800">{curveError}</p>}
            {puntos.length ? <AutoclaveCurve puntos={puntos} /> : <div className="grid h-64 place-items-center rounded-lg bg-slate-50 text-center text-sm text-slate-500">No hay puntos de telemetría disponibles para este lote.</div>}
          </section>

          <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="p-5 sm:p-6"><SectionHeading title="Etapas del ciclo" subtitle="Tiempos informados en UTC y duración calculada por el backend" /></div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[680px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-3 font-semibold">Fase</th><th className="px-5 py-3 font-semibold">Etapa</th><th className="px-5 py-3 font-semibold">Inicio</th><th className="px-5 py-3 font-semibold">Fin</th><th className="px-5 py-3 text-right font-semibold">Duración</th></tr></thead>
                <tbody className="divide-y divide-slate-100">
                  {reporte.fases.map((fase, index) => <tr key={`${fase.faseNum}-${fase.inicio}-${index}`}><td className="px-5 py-3.5 font-medium text-slate-700">{fase.faseNum}</td><td className="px-5 py-3.5 font-medium text-slate-900">{phaseName(fase.faseNum)}</td><td className="px-5 py-3.5 text-slate-600">{formatDate(fase.inicio)}</td><td className="px-5 py-3.5 text-slate-600">{formatDate(fase.fin)}</td><td className="px-5 py-3.5 text-right tabular-nums text-slate-700">{formatDuration(fase.duracionSeg)}</td></tr>)}
                  {!reporte.fases.length && <tr><td colSpan={5} className="px-5 py-10 text-center text-slate-500">El lote no contiene etapas registradas.</td></tr>}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}
    </div>
  )
}

function Reading({ label, value }: { label: string; value: string }) {
  return <div><p className="text-xs font-medium text-slate-500">{label}</p><p className="mt-1 text-sm font-semibold text-slate-900">{value}</p></div>
}

function Metric({ label, value, detail }: { label: string; value: string; detail: string }) {
  return <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-sm font-medium text-slate-600">{label}</p><p className="mt-3 text-2xl font-bold tracking-tight text-slate-950">{value}</p><p className="mt-1 text-xs text-slate-500">{detail}</p></article>
}

function SectionHeading({ title, subtitle }: { title: string; subtitle: string }) {
  return <div><h2 className="text-lg font-semibold text-slate-950">{title}</h2><p className="mt-1 text-sm text-slate-500">{subtitle}</p></div>
}

function metric(value: number | undefined, unit: string, decimals: number) {
  return value == null || !Number.isFinite(value) ? '—' : `${value.toFixed(decimals)}${unit}`
}
