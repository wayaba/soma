import React from 'react'
import { useParams } from 'react-router-dom'
import { Chart, registerables } from 'chart.js'
import type { Receta, Funcion, Variable, PasoReceta, RefAlarma, Alarma } from '@/types/types'

import { recetaFabService } from '@/services/recetaFab.service'
import { refFuncionesService } from '@/services/refFunciones.service'
import { variablesService } from '@/services/variables.service'

import RegistroEventosTable from '@/components/report/RegistroEventosTable'
import SummaryReport from '@/components/report/SummaryReport'
import ParametrosRecetaTable from '@/components/report/ParametrosRecetaTable'
import LineChartReport from '@/components/report/LineChartReport'
import BarChartReport from '@/components/report/BarChartReport'
import HorizontalBarChartReport from '@/components/report/HorizontalBarChartReport'
import RegistroAlarmasTable from '@/components/report/RegistroAlarmasTable'
import { refAlarmaService } from '@/services/refAlarma.service'
import { alarmaService } from '@/services/alarma.service'

Chart.register(...registerables)

const RecetaFabReport = () => {
  const { id } = useParams()

  // Tipado explícito de estados
  const [receta, setReceta] = React.useState<Receta | null>(null)
  const [funcionesList, setFuncionesList] = React.useState<Funcion[]>([])
  const [refAlarmasList, setRefAlarmasList] = React.useState<RefAlarma[]>([])
  const [alarmaByIdLote, setAlarmaByIdLote] = React.useState<Alarma[]>([])
  const [variablesPorPaso, setVariablesPorPaso] = React.useState<Record<string, Variable>>({})
  const [variablesByIdLote, setVariablesByIdLote] = React.useState<Variable[]>([])
  const [loading, setLoading] = React.useState(false)

  // Unificar carga de datos y variables en un solo useEffect
  React.useEffect(() => {
    let isMounted = true
    const header = document.getElementById('header-soma')
    if (header) header.style.display = 'none'

    const fetchAll = async () => {
      setLoading(true)
      try {
        if (!id) {
          setReceta(null)
          setFuncionesList([])
          setVariablesPorPaso({})
          setVariablesByIdLote([])
          setAlarmaByIdLote([])
          setRefAlarmasList([])
          setLoading(false)
          return
        }
        // Cargar receta y funcionesFab en paralelo
        const [recetaFabResponse, refFuncionesFabResponse, refAlarmaResponse] = await Promise.all([
          recetaFabService.getById(id),
          refFuncionesService.getAllFab(),
          refAlarmaService.getAll()
        ])
        if (!isMounted) return
        setReceta(recetaFabResponse.data)
        setFuncionesList(refFuncionesFabResponse.data)
        setRefAlarmasList(refAlarmaResponse.data)

        // Cargar variablesFabPorPaso y variablesFabByRange
        const recetaVar = recetaFabResponse.data
        if (recetaVar && recetaVar.pasos && recetaVar.pasos.length > 0) {
          // Variables por paso
          const results = await Promise.all(
            recetaVar.pasos.map(async (paso: PasoReceta) => {
              const fecha = typeof paso.fechaFin === 'string' ? paso.fechaFin : paso.fechaFin?.toISOString() || ''
              const res = await variablesService.getClosestByDateFab(fecha)
              return { pasoId: paso._id || '', variables: Array.isArray(res?.data) ? res.data[0] : res?.data }
            })
          )
          const dict: Record<string, Variable> = {}
          results.forEach(({ pasoId, variables }) => {
            if (pasoId && variables) dict[pasoId] = variables
          })
          if (isMounted) setVariablesPorPaso(dict)
        } else {
          if (isMounted) setVariablesPorPaso({})
        }
        // Variables por rango
        if (recetaVar && recetaVar.idLote) {
          const alarmasResponse = await alarmaService.getByIdLoteFab(recetaVar.idLote)
          const { data } = await variablesService.getByIdLoteFab(recetaVar.idLote)
          if (isMounted) {
            setVariablesByIdLote(data)
            setAlarmaByIdLote(alarmasResponse.data)
          }
        } else {
          if (isMounted) {
            setVariablesByIdLote([])
            setAlarmaByIdLote([])
          }
        }
      } finally {
        if (isMounted) setLoading(false)
      }
    }
    fetchAll()
    return () => {
      isMounted = false
      if (header) header.style.display = ''
    }
  }, [id])

  return (
    <>
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 bg-opacity-50">
          <div className="text-white text-xl font-bold animate-pulse">Cargando...</div>
        </div>
      )}
      {receta ? (
        <div id="summary-report-container" className="bg-white mt-3 text-gray-800">
          <SummaryReport receta={receta} />
          <br />
          <div className="mt-2 text-center font-semibold">Alarmas por hora</div>
          <RegistroAlarmasTable alarmasByLote={alarmaByIdLote} refAlarmasList={refAlarmasList} />
          <br />
          <div className="mt-2 text-center font-semibold">Registro de eventos</div>
          <RegistroEventosTable receta={receta} variablesPorPaso={variablesPorPaso} funcionesList={funcionesList} />
          <br />
          <div className="mt-2 text-center font-semibold">Parámetros de receta</div>
          <ParametrosRecetaTable pasos={receta.pasos || []} funcionesList={funcionesList} />
          <br />
          <div className="mt-2 text-center font-semibold">Gráficos</div>
          <LineChartReport variablesByIdLote={variablesByIdLote} />
          <br />
          <BarChartReport variablesByIdLote={variablesByIdLote} />
          <br></br>
          <HorizontalBarChartReport receta={receta} />
        </div>
      ) : null}
    </>
  )
}

export default RecetaFabReport
