import { Bar } from 'react-chartjs-2'
import type { Receta } from '@/types/types'
import moment from 'moment'

interface HorizontalBarChartReportProps {
  receta: Receta
}

const HorizontalBarChartReport = ({ receta }: HorizontalBarChartReportProps) => {
  const pasosArr = receta.pasos ?? []
  const charFaseIdLabel = pasosArr.map((paso) => paso.num)
  const charFaseTimeData = pasosArr.map((paso, i) => {
    let startDate, timeEnd
    if (i === 0) {
      startDate = moment(receta.fechaInicio)
      timeEnd = moment(paso.fechaFin)
    } else {
      startDate = moment(pasosArr[i - 1]?.fechaFin)
      timeEnd = moment(paso.fechaFin)
    }
    const diffMs = timeEnd.diff(startDate)
    //return parseFloat((diffMs / 60000).toFixed(1)) // minutos con 1 decimal
    return parseFloat((diffMs / 1000).toFixed(1)) // segundos con 1 decimal
  })

  // Paletas base
  const baseBgColors = ['rgba(83, 83, 236, 0.55)', 'rgba(93, 194, 105, 0.55)', 'rgba(250, 204, 46, 0.6)', 'rgba(6, 31, 102, 0.45)']
  const baseBorderColors = ['#5353ec', '#5dc269', '#facc2e', '#061f66']
  const bgColors = charFaseTimeData.map((_, i) => baseBgColors[i % baseBgColors.length])
  const borderColors = charFaseTimeData.map((_, i) => baseBorderColors[i % baseBorderColors.length])

  console.log('charFaseIdLabel', charFaseIdLabel)
  const data = {
    labels: charFaseIdLabel,
    datasets: [
      {
        label: 'Tiempo [min]',
        data: charFaseTimeData,
        backgroundColor: bgColors,
        borderColor: borderColors,
        borderWidth: 1
      }
    ]
  }

  const options = {
    responsive: true,
    indexAxis: 'y' as const, // Hace el gráfico horizontal
    plugins: {
      title: {
        display: true,
        text: 'Tiempos por Paso'
      }
    },
    scales: {
      x: {
        beginAtZero: true,
        min: 0,
        title: {
          display: true,
          text: 'min'
        }
      },
      y: {
        offset: true,
        title: {
          display: true,
          text: 'Pasos'
        }
      }
    }
  }

  // Altura dinámica según cantidad de pasos
  const dynamicHeight = Math.max(300, pasosArr.length * 2)

  return (
    <div className="flex max-w-4xl items-center m-auto">
      <Bar data={data} options={options} height={dynamicHeight} />
    </div>
  )
}

export default HorizontalBarChartReport
