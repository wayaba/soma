import type { PuntoTelemetria } from '@/types/autoclaves'

interface Props { puntos: PuntoTelemetria[] }
const WIDTH = 960
const HEIGHT = 300
const PAD = { top: 18, right: 52, bottom: 38, left: 48 }

export default function AutoclaveCurve({ puntos }: Props) {
  const chartPoints = puntos.filter((point) =>
    Number.isFinite(point.temp1) && Number.isFinite(point.temp2) && Number.isFinite(point.presion),
  )
  const innerWidth = WIDTH - PAD.left - PAD.right
  const innerHeight = HEIGHT - PAD.top - PAD.bottom
  const temps = chartPoints.flatMap((point) => [point.temp1 as number, point.temp2 as number])
  const minTemp = Math.min(0, ...temps)
  const maxTemp = Math.max(140, ...temps)
  const maxPressure = Math.max(4, ...chartPoints.map((point) => point.presion as number))
  const x = (index: number) => PAD.left + (chartPoints.length < 2 ? innerWidth / 2 : (index / (chartPoints.length - 1)) * innerWidth)
  const tempY = (value: number) => PAD.top + innerHeight - ((value - minTemp) / (maxTemp - minTemp || 1)) * innerHeight
  const pressureY = (value: number) => PAD.top + innerHeight - (value / maxPressure) * innerHeight
  const path = (value: (point: PuntoTelemetria) => number, y: (value: number) => number) => chartPoints
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${x(index).toFixed(1)} ${y(value(point)).toFixed(1)}`)
    .join(' ')
  const timeLabel = (index: number) => new Date(chartPoints[index].timestamp).toLocaleTimeString('es-AR', {
    hour: '2-digit', minute: '2-digit', timeZone: 'America/Argentina/Buenos_Aires',
  })

  return (
    <div className="w-full overflow-x-auto">
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label="Curva de temperaturas y presión durante el ciclo" className="h-80 min-w-[680px] w-full">
        {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
          const y = PAD.top + innerHeight * ratio
          const temp = maxTemp - (maxTemp - minTemp) * ratio
          const pressure = maxPressure * (1 - ratio)
          return <g key={ratio}><line x1={PAD.left} x2={WIDTH - PAD.right} y1={y} y2={y} stroke="#e2e8f0" /><text x={PAD.left - 8} y={y + 4} textAnchor="end" fontSize="10" fill="#64748b">{Math.round(temp)}°</text><text x={WIDTH - PAD.right + 8} y={y + 4} fontSize="10" fill="#64748b">{pressure.toFixed(1)}</text></g>
        })}
        <text x={PAD.left} y={HEIGHT - 5} fontSize="10" fill="#64748b">{chartPoints.length ? timeLabel(0) : ''}</text>
        <text x={WIDTH - PAD.right} y={HEIGHT - 5} textAnchor="end" fontSize="10" fill="#64748b">{chartPoints.length ? timeLabel(chartPoints.length - 1) : ''}</text>
        <path d={path((point) => point.temp1 as number, tempY)} fill="none" stroke="#5353ec" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
        <path d={path((point) => point.temp2 as number, tempY)} fill="none" stroke="#061f66" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
        <path d={path((point) => point.presion as number, pressureY)} fill="none" stroke="#5dc269" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      </svg>
      <div className="mt-1 flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs text-slate-600">
        <Legend color="#5353ec" label="Temp. cámara (°C)" /><Legend color="#061f66" label="Temp. drenaje (°C)" /><Legend color="#5dc269" label="Presión (bar)" />
      </div>
    </div>
  )
}

function Legend({ color, label }: { color: string; label: string }) {
  return <span className="inline-flex items-center gap-2"><span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />{label}</span>
}
