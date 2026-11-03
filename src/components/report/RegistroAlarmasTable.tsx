import moment from 'moment'
import type { Alarma, RefAlarma } from '@/types/types'

interface RegistroAlarmasTableProps {
  alarmasByLote: Alarma[]
  refAlarmasList: RefAlarma[]
}

const RegistroAlarmasTable = ({ alarmasByLote, refAlarmasList }: RegistroAlarmasTableProps) => {
  function getTimeFormated(date: string | Date | undefined) {
    if (!date) return '-'
    let i = new Date(date)
    return moment(i).format('HH:mm:ss')
  }
  console.log('alarmasByLote', alarmasByLote)
  // Validación: si no hay alarmas o ninguna alarma tiene array alarmas con datos, no renderizar
  const hasAlarmas = alarmasByLote && alarmasByLote.some((a) => Array.isArray(a.alarmas) && a.alarmas.length > 0)
  return (
    <div className="mt-3 overflow-x-auto">
      <table className="divide-y divide-gray-200 m-auto max-w-4xl" id="tablaResultados">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Hora</th>
            <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Alarma</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {hasAlarmas ? (
            alarmasByLote.map((alarma) =>
              Array.isArray(alarma.alarmas)
                ? alarma.alarmas.map((idAlarma, idx) => {
                    const ref = refAlarmasList.find((r) => r.idAlarma === idAlarma)
                    return (
                      <tr key={alarma._id + '-' + idAlarma + '-' + idx} className="items-center text-center">
                        <td>{getTimeFormated(alarma.fecha)}</td>
                        <td>{ref ? ref.texto : idAlarma}</td>
                      </tr>
                    )
                  })
                : null
            )
          ) : (
            <tr>
              <td colSpan={2} className="text-center py-4 text-gray-500">
                No hay datos disponibles
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

export default RegistroAlarmasTable
