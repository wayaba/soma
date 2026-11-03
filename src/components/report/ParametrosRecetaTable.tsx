import type { PasoReceta, Funcion } from '@/types/types'

interface ParametrosRecetaTableProps {
  pasos: PasoReceta[]
  funcionesList: Funcion[]
}

const ParametrosRecetaTable = ({ pasos, funcionesList }: ParametrosRecetaTableProps) => {
  const hasPasos = Array.isArray(pasos) && pasos.length > 0
  return (
    <div className="mt-3 overflow-x-auto">
      <table className="divide-y divide-gray-200 m-auto max-w-4xl" id="tablaResultados">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Paso</th>
            <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Función</th>
            <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">SP Presión</th>
            <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">SP Temperatura</th>
            <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">SP Carga</th>
            <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">SP Agitación</th>
            <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Tiempo</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {hasPasos ? (
            pasos.map((paso) => {
              return (
                <tr key={paso._id || paso.num} className="items-center text-center">
                  <td>{paso.num}</td>
                  <td>{funcionesList.find((item) => item.idFuncion === paso.func)?.texto}</td>
                  <td>{paso.spPresion !== undefined ? Number(paso.spPresion).toFixed(3) : '-'}</td>
                  <td>{paso.spTemp !== undefined ? Number(paso.spTemp).toFixed(3) : '-'}</td>
                  <td>{paso.spCarga !== undefined ? Number(paso.spCarga).toFixed(3) : '-'}</td>
                  <td>{paso.spAgit !== undefined ? Number(paso.spAgit).toFixed(3) : '-'}</td>
                  <td>{paso.spTiempo !== undefined ? Number(paso.spTiempo).toFixed(3) : '-'}</td>
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

export default ParametrosRecetaTable
