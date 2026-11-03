import { Link } from 'react-router-dom'

const Home = () => {
  return (
    <div className="brand-panel mx-auto my-12 max-w-3xl overflow-hidden">
      <div className="relative flex flex-col items-center gap-5 px-7 py-14 text-center sm:px-16 sm:py-20">
        <span className="rounded-full bg-[#5353ec]/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-primary">SOMA · Esterilización segura</span>
        <h1 className="max-w-2xl text-4xl font-extrabold leading-tight tracking-tight text-soma md:text-5xl">Control claro para procesos críticos</h1>
        <p className="max-w-xl text-base leading-7 text-brand-muted">Reportes y seguimiento de ciclos de autoclave, con la trazabilidad de cada etapa y sus variables de proceso.</p>
        <Link to="/login" className="brand-button mt-3 inline-flex items-center gap-2 px-6 py-3 no-underline hover:no-underline">
          Ingresar al sistema <span aria-hidden="true">→</span>
        </Link>
      </div>
    </div>
  )
}

export default Home
