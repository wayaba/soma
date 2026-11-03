import moment from 'moment'
import somaLogo from '@/assets/images/logo-soma.png'
import { getDateTimeFormated, getDuracion } from '@/utils/commonFunctions'
import type { Receta } from '@/types/types'

interface SummaryReportProps {
  receta: Receta
}

const SummaryReport = ({ receta }: SummaryReportProps) => {
  if (!receta) return null
  return (
    <>
      <div className="grid grid-cols-3">
        <div className="col-span-1">
          <img className="p-2" width={100} src={somaLogo} alt="SOMA" />
        </div>
      </div>
      <div className="flex flex-cols-2 justify-around">
        <div>LOTE: {receta.lote}</div>
        <div>Fecha impresión: {moment().format('DD-MM-YYYY')}</div>
      </div>
      <hr></hr>
      <div className="mx-auto border border-gray-300 rounded-lg justify-center">
        <div className="bg-gray-100 px-4 py-2 rounded-t-lg text-center">
          <h2 className="text-2xl font-bold">
            <b>BATCH RECORD Lote {receta.lote}</b>
          </h2>
        </div>
        <div className="grid grid-cols-2 px-4 py-2 text-center">
          <div className="">
            <div>Receta: {receta.receta}</div>
            <div>Usuario: {receta.usuario}</div>
            <div>Peso Final: {receta.pesoFinal} Kg</div>
          </div>
          <div className="">
            <div>Fecha Inicio: {getDateTimeFormated(receta.fechaInicio)}</div>
            <div>Fecha Fin: {getDateTimeFormated(receta.fechaFin)}</div>
            <div>Duración: {getDuracion(receta.fechaInicio, receta.fechaFin)} min</div>
          </div>
        </div>
      </div>
    </>
  )
}

export default SummaryReport
