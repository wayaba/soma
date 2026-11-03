import type { Request, Response } from 'express'
import db from '../models/index.js'
import type { LoteDocument } from '../models/autoclave.model.js'

const allowedAutoclaves = [1, 2] as const

export async function getCurvaLote(req: Request<{ loteId: string }>, res: Response) {
  try {
    const loteId = req.params.loteId.trim()
    if (!loteId) return res.status(400).json({ error: 'Debe indicar el código del lote' })
    const puntos = await db.telemetria.find(
      { 'meta.loteId': loteId },
      { timestamp: 1, meta: 1, temp1: 1, temp2: 1, presion: 1, fase: 1, _id: 0 },
    ).sort({ timestamp: 1 }).lean()
    return res.json(puntos)
  } catch (error) {
    console.error('Error al obtener curva de telemetría:', error)
    return res.status(500).json({ error: 'Error al obtener curva de telemetría' })
  }
}

export async function getEstadoActual(_req: Request, res: Response) {
  try {
    const [lotesActivos, ...telemetriaActual] = await Promise.all([
      db.lote.find({ estado: 1 }).sort({ timestampInicio: -1 }).lean(),
      ...allowedAutoclaves.map((autoclaveId) => db.telemetria
        .findOne({ 'meta.autoclaveId': autoclaveId })
        .sort({ timestamp: -1 })
        .lean()),
    ])
    return res.json({ lotesActivos, telemetriaActual })
  } catch (error) {
    console.error('Error al consultar estado actual de autoclaves:', error)
    return res.status(500).json({ error: 'Error al consultar estado en vivo' })
  }
}

export async function getReporteLote(req: Request<{ loteId: string }>, res: Response) {
  try {
    const loteId = req.params.loteId.trim()
    if (!loteId) return res.status(400).json({ error: 'Debe indicar el código del lote' })
    const loteDoc = await db.lote.findOne({ lote: loteId }).lean() as unknown as LoteDocument | null
    if (!loteDoc) return res.status(404).json({ error: 'Lote no encontrado' })

    const fases = (loteDoc.fases ?? []).map((fase) => {
      const inicioMs = fase.inicio ? new Date(fase.inicio).getTime() : NaN
      const finMs = fase.fin ? new Date(fase.fin).getTime() : NaN
      const duracionSeg = Number.isFinite(inicioMs) && Number.isFinite(finMs)
        ? Math.max(0, Math.round((finMs - inicioMs) / 1000))
        : null
      return { faseNum: fase.faseNum, inicio: fase.inicio ?? null, fin: fase.fin ?? null, duracionSeg }
    })

    const [metricas] = await db.telemetria.aggregate([
      { $match: { 'meta.loteId': loteId } },
      { $group: {
        _id: null,
        tempMaxCamara: { $max: '$temp1' },
        tempMinMeseta: { $min: { $cond: [{ $and: [{ $eq: ['$fase', 4] }, { $ne: ['$temp1', null] }] }, '$temp1', null] } },
        presionMax: { $max: '$presion' },
        muestrasTotal: { $sum: 1 },
      } },
      { $project: { _id: 0 } },
    ])
    return res.json({ cabecera: loteDoc, fases, metricas: metricas ?? {} })
  } catch (error) {
    console.error('Error al consolidar reporte de lote:', error)
    return res.status(500).json({ error: 'Error al consolidar reporte del lote' })
  }
}

type LoteQuery = { autoclaveId?: string; estado?: string; desde?: string; hasta?: string; lote?: string; limit?: string }

export async function getLotes(req: Request<Record<string, never>, unknown, unknown, LoteQuery>, res: Response) {
  try {
    const filter: Record<string, any> = {}
    if (req.query.autoclaveId !== undefined) {
      const id = Number(req.query.autoclaveId)
      if (!allowedAutoclaves.includes(id as 1 | 2)) return res.status(400).json({ error: 'autoclaveId debe ser 1 o 2' })
      filter.autoclaveId = id
    }
    if (req.query.estado !== undefined) {
      const estado = Number(req.query.estado)
      if (![1, 2, 3].includes(estado)) return res.status(400).json({ error: 'estado debe ser 1, 2 o 3' })
      filter.estado = estado
    }
    if (req.query.desde || req.query.hasta) {
      const range: { $gte?: Date; $lte?: Date } = {}
      if (req.query.desde) {
        const desde = new Date(req.query.desde)
        if (!Number.isFinite(desde.getTime())) return res.status(400).json({ error: 'desde debe ser una fecha ISO válida' })
        range.$gte = desde
      }
      if (req.query.hasta) {
        const hasta = new Date(req.query.hasta)
        if (!Number.isFinite(hasta.getTime())) return res.status(400).json({ error: 'hasta debe ser una fecha ISO válida' })
        range.$lte = hasta
      }
      filter.timestampInicio = range
    }
    if (req.query.lote) filter.lote = req.query.lote.trim()
    const parsedLimit = Number.parseInt(req.query.limit ?? '', 10) || 50
    const limit = Math.min(Math.max(parsedLimit, 1), 200)
    return res.json(await db.lote.find(filter).sort({ timestampInicio: -1 }).limit(limit).lean())
  } catch (error) {
    console.error('Error al listar lotes:', error)
    return res.status(500).json({ error: 'Error al listar lotes' })
  }
}

export async function getReferenciasAutoclaves(_req: Request, res: Response) {
  try {
    const [fases, estados, maquinas] = await Promise.all([
      db.refFase.find().sort({ faseNum: 1 }).lean(),
      db.refEstado.find().sort({ estadoId: 1 }).lean(),
      db.refMaquina.find().sort({ autoclaveId: 1 }).lean(),
    ])
    return res.json({ fases, estados, maquinas })
  } catch (error) {
    console.error('Error al consultar catálogos de autoclaves:', error)
    return res.status(500).json({ error: 'Error al consultar catálogos' })
  }
}

export async function getFases(_req: Request, res: Response) {
  try { return res.json(await db.refFase.find().sort({ faseNum: 1 }).lean()) }
  catch (error) { console.error(error); return res.status(500).json({ error: 'Error al consultar fases' }) }
}

export async function getEstados(_req: Request, res: Response) {
  try { return res.json(await db.refEstado.find().sort({ estadoId: 1 }).lean()) }
  catch (error) { console.error(error); return res.status(500).json({ error: 'Error al consultar estados' }) }
}

export async function getMaquinas(_req: Request, res: Response) {
  try { return res.json(await db.refMaquina.find().sort({ autoclaveId: 1 }).lean()) }
  catch (error) { console.error(error); return res.status(500).json({ error: 'Error al consultar máquinas' }) }
}
