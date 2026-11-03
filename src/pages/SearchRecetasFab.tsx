import { useState } from 'react'
import SearchRecetasFabForm from '@/components/SearchRecetasFabForm'
import moment from 'moment'
import type { Receta } from '@/types/types'
import GenericList, { type Field } from '@/components/GenericList'
import ItemReceta from '@/components/ItemReceta'

const fields: Field<Receta>[] = [
  {
    key: 'fechaInicio',
    label: 'Inicio',
    formatter: (val: any) => moment(val).format('DD/MM/YYYY HH:mm:ss')
  },
  {
    key: 'fechaFin',
    label: 'Fin',
    formatter: (val: any) => moment(val).format('DD/MM/YYYY HH:mm:ss')
  },
  { key: 'receta', label: 'Receta' },
  { key: 'lote', label: 'Lote' },
  { key: 'pesoFinal', label: 'Peso final', formatter: (val: any) => `${val} kg` },
  { key: 'usuario', label: 'Usuario' },
  { key: 'equipo', label: 'Equipo' },
  {
    key: 'reporte',
    label: 'Reporte',
    formatter: (_: any, record?: Receta) =>
      record ? (
        <a href={`/recetaFabReport/${record._id}`} target="_blank" rel="noreferrer" className="text-slate-900 hover:text-slate-700 underline">
          Ver reporte
        </a>
      ) : null
  }
]

const SearchRecetasFab = () => {
  const [results, setResults] = useState<Receta[]>([])
  const [searchDone, setSearchDone] = useState(false)

  const onResults = (results: Receta[]) => {
    setResults(results)
    setSearchDone(true)
  }

  const renderResults = () => {
    return results.length === 0 ? (
      <>
        <span />
        <span className="mt-3" key="warning">
          No se han encontrado datos
        </span>
      </>
    ) : (
      <div className="rounded-lg mt-2 px-8 py-10 flex w-full">
        <GenericList items={results} fields={fields} RowComponent={ItemReceta} getKey={(receta) => receta.lote} />
      </div>
    )
  }

  return (
    <div className="grid justify-items-center m-auto">
      <div className="brand-panel grid justify-items-stretch px-6 py-8 shadow-lg sm:px-10">
        <SearchRecetasFabForm onResults={onResults} />
      </div>
      {searchDone ? renderResults() : <small />}
    </div>
  )
}

export default SearchRecetasFab
