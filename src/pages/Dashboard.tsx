import { Link } from 'react-router-dom'

export default function Dashboard() {
  return (
    <div className="mx-auto my-10 w-full max-w-5xl px-4 sm:px-6">
      <header className="mb-7">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">SOMA · Esterilización</p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-950">Reportes de autoclaves</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">Consultá ciclos, revisá la trazabilidad de sus fases y generá reportes con las mediciones registradas por los PLC.</p>
      </header>

      <Link to="/autoclaves/reportes" className="group block rounded-2xl border border-slate-200 bg-white p-6 shadow-sm no-underline transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lg sm:p-8">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div>
            <span className="inline-flex rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">Lotes · Telemetría · Fases</span>
            <h2 className="mt-4 text-xl font-bold text-slate-950">Explorar historial de ciclos</h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600">Filtrá por autoclave, estado o fecha. Abrí un lote para ver métricas, duración por fase y curvas de temperatura y presión.</p>
          </div>
          <span className="brand-button inline-flex items-center justify-center gap-2 px-5 py-3 text-sm">Ver lotes <span aria-hidden="true">→</span></span>
        </div>
      </Link>
    </div>
  )
}
