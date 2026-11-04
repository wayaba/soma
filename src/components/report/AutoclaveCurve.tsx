import type { PuntoTelemetria, ReferenciaSensor } from '@/types/autoclaves'

interface Props {
  puntos: PuntoTelemetria[]
  sensores?: ReferenciaSensor[]
}
const WIDTH = 960
const HEIGHT = 330
const PAD = { top: 34, right: 76, bottom: 54, left: 66 }

export default function AutoclaveCurve({ puntos, sensores = [] }: Props) {
  const chartPoints = puntos.filter((point) => Number.isFinite(point.temp1) && Number.isFinite(point.temp2) && Number.isFinite(point.presion))
  const innerWidth = WIDTH - PAD.left - PAD.right
  const innerHeight = HEIGHT - PAD.top - PAD.bottom
  const temps = chartPoints.flatMap((point) => [point.temp1 as number, point.temp2 as number])
  const minTemp = Math.min(0, ...temps)
  const maxTemp = Math.max(140, ...temps)
  const pressures = chartPoints.map((point) => point.presion as number)
  const minPressure = Math.min(0, ...pressures)
  const maxPressure = Math.max(4, ...pressures)
  const temperatureSensors = sensores.filter((sensor) => sensor.unidad.toLowerCase().includes('\u00b0c'))
  const temp1Sensor = temperatureSensors[0]
  const temp2Sensor = temperatureSensors[1]
  const pressureSensor = sensores.find((sensor) => sensor.clave === 'presion')
  const sensorLabel = (sensor: ReferenciaSensor | undefined, fallback: string) => sensor?.nombre || fallback
  const sensorUnit = (sensor: ReferenciaSensor | undefined, fallback: string) => sensor?.unidad || fallback
  const x = (index: number) => PAD.left + (chartPoints.length < 2 ? innerWidth / 2 : (index / (chartPoints.length - 1)) * innerWidth)
  const timeTickIndexes = Array.from(
    new Set([
      0,
      Math.round((chartPoints.length - 1) / 4),
      Math.round((chartPoints.length - 1) / 2),
      Math.round((3 * (chartPoints.length - 1)) / 4),
      chartPoints.length - 1
    ])
  ).filter((index) => index >= 0)
  const tempY = (value: number) => PAD.top + innerHeight - ((value - minTemp) / (maxTemp - minTemp || 1)) * innerHeight
  const pressureY = (value: number) => PAD.top + innerHeight - ((value - minPressure) / (maxPressure - minPressure || 1)) * innerHeight
  const path = (value: (point: PuntoTelemetria) => number, y: (value: number) => number) =>
    chartPoints.map((point, index) => `${index === 0 ? 'M' : 'L'} ${x(index).toFixed(1)} ${y(value(point)).toFixed(1)}`).join(' ')
  const timeLabel = (index: number) =>
    new Date(chartPoints[index].timestamp).toLocaleTimeString('es-AR', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'America/Argentina/Buenos_Aires'
    })

  return (
    <div className="curve-chart w-full overflow-x-auto">
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        role="img"
        aria-label="Curva de temperaturas y presión durante el ciclo"
        className="curve-chart-svg h-[22rem] min-w-[720px] w-full"
      >
        <text x={PAD.left} y={13} fontSize="11" fontWeight="600" fill="#475569">
          {sensorLabel(temp1Sensor, 'Temperatura')} ({sensorUnit(temp1Sensor, '°C')})
        </text>
        <text x={WIDTH - PAD.right} y={13} textAnchor="end" fontSize="11" fontWeight="600" fill="#475569">
          {sensorLabel(pressureSensor, 'Presión')} ({sensorUnit(pressureSensor, 'bar')})
        </text>
        {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
          const y = PAD.top + innerHeight * ratio
          const temp = maxTemp - (maxTemp - minTemp) * ratio
          const pressure = maxPressure - (maxPressure - minPressure) * ratio
          return (
            <g key={ratio}>
              <line x1={PAD.left} x2={WIDTH - PAD.right} y1={y} y2={y} stroke="#e2e8f0" />
              <text x={PAD.left - 8} y={y + 4} textAnchor="end" fontSize="10" fill="#64748b">
                {Math.round(temp)}C°
              </text>
              <text x={WIDTH - PAD.right + 8} y={y + 4} fontSize="10" fill="#64748b">
                {pressure.toFixed(1)}
              </text>
            </g>
          )
        })}
        {timeTickIndexes.map((index) => (
          <g key={index}>
            <line x1={x(index)} x2={x(index)} y1={PAD.top + innerHeight} y2={PAD.top + innerHeight + 4} stroke="#94a3b8" />
            <text
              x={x(index)}
              y={PAD.top + innerHeight + 17}
              textAnchor={index === 0 ? 'start' : index === chartPoints.length - 1 ? 'end' : 'middle'}
              fontSize="10"
              fill="#64748b"
            >
              {timeLabel(index)}
            </text>
          </g>
        ))}
        <text x={PAD.left + innerWidth / 2} y={HEIGHT - 4} textAnchor="middle" fontSize="11" fontWeight="600" fill="#475569">
          Tiempo (hora local)
        </text>
        <path d={path((point) => point.temp1 as number, tempY)} fill="none" stroke="#5353ec" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
        <path d={path((point) => point.temp2 as number, tempY)} fill="none" stroke="#061f66" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
        <path
          d={path((point) => point.presion as number, pressureY)}
          fill="none"
          stroke="#5dc269"
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      </svg>
      <div className="mt-1 flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs text-slate-600">
        <Legend color="#5353ec" label={`${sensorLabel(temp1Sensor, 'Temperatura 1')} (${sensorUnit(temp1Sensor, '°C')})`} />
        <Legend color="#061f66" label={`${sensorLabel(temp2Sensor, 'Temperatura 2')} (${sensorUnit(temp2Sensor, '°C')})`} />
        <Legend color="#5dc269" label={`${sensorLabel(pressureSensor, 'Presión')} (${sensorUnit(pressureSensor, 'bar')})`} />
      </div>
    </div>
  )
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
      {label}
    </span>
  )
}
