import moment from 'moment'
import type { Receta, Funcion, Variable } from '@/types/types'

interface RegistroEventosTableProps {
  receta: Receta
  variablesPorPaso: Record<string, Variable>
  funcionesList: Funcion[]
}

const RegistroEventosTable = ({ receta, variablesPorPaso, funcionesList }: RegistroEventosTableProps) => {
  function getTimeFormated(date: string | Date | undefined) {
    if (!date) return '-'
    let i = new Date(date)
    return moment(i).format('HH:mm:ss')
  }
  function getDuracion(paso: any, index: number, pasosArr: any[], receta: Receta) {
    let startDate, timeEnd
    if (index === 0) {
      startDate = moment(receta.fechaInicio)
      timeEnd = moment(paso.fechaFin)
    } else {
      startDate = moment(pasosArr[index - 1]?.fechaFin)
      timeEnd = moment(paso.fechaFin)
    }
    if (!startDate || !timeEnd || !startDate.isValid() || !timeEnd.isValid()) return '-'
    const diffMs = timeEnd.diff(startDate)
    return parseFloat((diffMs / 1000).toFixed(1)) // segundos con 1 decimal
  }
  const hasPasos = Array.isArray(receta.pasos) && receta.pasos.length > 0
  return (
    <div className="mt-3 overflow-x-auto">
      <table className="divide-y divide-gray-200 m-auto max-w-4xl" id="tablaResultados">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Paso</th>
            <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Hora</th>
            <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Id Función</th>
            <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Función</th>
            <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Peso [Kg]</th>
            <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">T° Prod. [°C]</th>
            <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Duración</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {hasPasos ? (
            receta.pasos?.map((paso, i, arr) => {
              const variables = variablesPorPaso[paso._id || '']
              return (
                <tr key={paso._id || paso.num} className="items-center text-center">
                  <td>{paso.num}</td>
                  <td>{getTimeFormated(paso.fechaFin)}</td>
                  <td>{paso.func}</td>
                  <td>{funcionesList.find((item) => item.idFuncion === paso.func)?.texto}</td>
                  <td>{variables && variables.peso !== undefined ? Number(variables.peso).toFixed(3) : '-'}</td>
                  <td>{variables && variables.temperatura !== undefined ? Number(variables.temperatura).toFixed(3) : '-'}</td>
                  <td>{getDuracion(paso, i, arr, receta)}</td>
                </tr>
              )
            })
          ) : (
            <tr>
              <td colSpan={7} className="text-center py-4 text-gray-500">
                No hay datos disponibles
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

export default RegistroEventosTable
