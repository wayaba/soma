import { useForm, type SubmitHandler } from 'react-hook-form'
import { useState } from 'react'
import { recetaFabService } from '../services/recetaFab.service'

const equipoList = [
  { value: '', label: 'Seleccione' },
  { value: '1', label: 'Reactor 1' },
  { value: '2', label: 'Reactor 2' }
]

export interface SearchRecetasFabFormInputs {
  receta?: string
  lote?: string
  equipo?: string
  fechaInicio?: string
  fechaFin?: string
}

export interface SearchRecetasFabFormProps {
  onResults: (res: any) => void
}

const SearchRecetasFabForm: React.FC<SearchRecetasFabFormProps> = ({ onResults }) => {
  const {
    register,
    handleSubmit,
    formState: { errors: _errors }
  } = useForm<SearchRecetasFabFormInputs>()
  const [loading, setLoading] = useState(false)

  const onSubmit: SubmitHandler<SearchRecetasFabFormInputs> = ({ receta, lote, fechaInicio, fechaFin, equipo }) => {
    setLoading(true)
    let desde: string | null = null
    let hasta: string | null = null
    if (fechaInicio) {
      desde = `${fechaInicio} 00:00:00`
    }
    if (fechaFin) {
      hasta = `${fechaFin} 23:59:59`
    }
    const recetaSearch = {
      receta,
      lote,
      equipo,
      fechaInicio: desde,
      fechaFin: hasta
    }
    console.log('(recetaSearch)', recetaSearch)
    recetaFabService
      .search(recetaSearch)
      .then((res: any) => {
        onResults(res)
      })
      .catch((err: any) => {
        if (err.response && (err.response.status === 401 || err.response.status === 403)) {
          window.location.href = '/'
        }
      })
      .finally(() => setLoading(false))
  }

  return (
    <div className="text-brand-ink">
      <div className="mb-8 flex flex-col items-center">
        <div className="text-center">
          <h1 className="mb-2 text-2xl">Búsqueda de reportes de fabricación</h1>
          <div className="text-brand-muted">Aplique filtros para ejecutar búsqueda</div>
        </div>
      </div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="flex flex-col items-center text-center">
          <div className="flex flex-row gap-3 m-2">
            <label>Receta</label>
            <input
              type="text"
              {...register('receta')}
              className="rounded-3xl text-gray-700 border-none max-w-32 focus:bg-slate-200 px-4 py-2 text-center shadow-lg outline-none backdrop-blur-md"
            />
            <label>Lote</label>
            <input
              type="text"
              {...register('lote')}
              className="rounded-3xl text-gray-700 border-none max-w-32 focus:bg-slate-200 px-4 py-2 text-center shadow-lg outline-none backdrop-blur-md"
            />
            <label>Equipo</label>
            <select
              {...register('equipo')}
              className="rounded-3xl border-none text-gray-700 focus:bg-opacity-20 bg-opacity-50 px-6 py-2 text-center shadow-lg outline-none backdrop-blur-md"
              defaultValue=""
            >
              {equipoList.map((equipo) => (
                <option className="text-center" value={equipo.value} key={equipo.value}>
                  {equipo.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-row gap-4 m-2 w-max">
            <label>Fecha desde</label>
            <input
              type="date"
              {...register('fechaInicio')}
              className="rounded-3xl border-none text-gray-700 focus:bg-opacity-20 bg-opacity-50 px-6 py-2 text-center placeholder-slate-200 shadow-lg outline-none backdrop-blur-md"
            />
            <label>Fecha hasta</label>
            <input
              type="date"
              {...register('fechaFin')}
              className="rounded-3xl border-none focus:bg-opacity-20 px-6 py-2 text-center text-gray-700 placeholder-slate-200 shadow-lg outline-none backdrop-blur-md"
            />
          </div>
          <div className="mt-8 flex justify-center text-lg text-black">
            <button
              type="submit"
              className="brand-button rounded-3xl px-10 py-2"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <span className="inline-block w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin"></span>
                  Cargando...
                </div>
              ) : (
                <span className="hover:text-gray-300">Buscar</span>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}

export default SearchRecetasFabForm
