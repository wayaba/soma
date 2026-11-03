import { Bar } from 'react-chartjs-2'
import { getDateTimeFormated } from '@/utils/commonFunctions'
import type { Variable } from '@/types/types'

interface BarChartReportProps {
  variablesByIdLote: Variable[]
}

const BarChartReport = ({ variablesByIdLote }: BarChartReportProps) => {
  const data = {
    labels: variablesByIdLote.map((item) => getDateTimeFormated(item.timestamp)),
    datasets: [
      {
        label: 'Agitación [RPM]',
        data: variablesByIdLote.map((item) => item.agitacion),
        fill: false,
        backgroundColor: 'rgba(83, 83, 236, 0.65)',
        borderColor: '#5353ec',
        borderWidth: 4,
        yAxisID: 'y1'
      }
    ]
  }

  const options = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: 'Agitación por Paso'
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
          text: 'RPM'
        }
      }
    }
  }

  return (
    <div className="flex max-w-4xl items-center m-auto">
      <Bar data={data} options={options} />
    </div>
  )
}

export default BarChartReport
