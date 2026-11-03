import { Line } from 'react-chartjs-2'
import { getDateTimeFormated } from '@/utils/commonFunctions'
import type { Variable } from '@/types/types'

interface LineChartReportProps {
  variablesByIdLote: Variable[]
}

const LineChartReport = ({ variablesByIdLote }: LineChartReportProps) => {
  const data = {
    labels: variablesByIdLote.map((item) => getDateTimeFormated(item.timestamp)),
    datasets: [
      {
        label: 'Peso [Kg]',
        data: variablesByIdLote.map((item) => item.peso),
        fill: false,
        backgroundColor: '#5dc269',
        borderColor: '#5dc269',
        borderWidth: 4,
        yAxisID: 'y1'
      },
      {
        label: 'T° [°C]',
        data: variablesByIdLote.map((item) => item.temperatura),
        fill: false,
        backgroundColor: '#5353ec',
        borderColor: '#5353ec',
        borderWidth: 4,
        yAxisID: 'y2'
      }
    ]
  }

  const options = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: 'Peso y Temperaturas por Paso'
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Pasos'
        }
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        title: {
          display: true,
          text: 'Kg'
        }
      },
      y2: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        grid: {
          drawOnChartArea: false
        },
        title: {
          display: true,
          text: '°C'
        }
      }
    }
  }

  return (
    <div className="flex max-w-4xl items-center m-auto">
      <Line data={data} options={options} />
    </div>
  )
}

export default LineChartReport
