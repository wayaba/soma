import mongoose, { Schema, type Model, type Types } from 'mongoose'

export interface FaseItem { faseNum: number; inicio: Date; fin: Date | null }
export interface LoteDocument {
  _id: Types.ObjectId
  autoclaveId: 1 | 2
  lote: string
  recetaId: number
  estado: 1 | 2 | 3
  faseActual: number
  timestampInicio: Date
  timestampFin: Date | null
  fases: FaseItem[]
}
export interface TelemetriaDocument {
  _id: Types.ObjectId
  timestamp: Date
  meta: { autoclaveId: 1 | 2; loteId: string | null }
  temp1?: number
  temp2?: number
  presion?: number
  fase?: number
}
export interface RefFaseDocument { _id: number; faseNum: number; nombre: string; activo: boolean }
export interface RefEstadoDocument { _id: number; estadoId: number; codigo: string; nombre: string; descripcion: string; color: string }
export interface RefMaquinaDocument { _id: number; autoclaveId: number; codigo: string; nombre: string; descripcion: string; activo: boolean }

const faseItemSchema = new Schema({
  faseNum: { type: Number, required: true, min: 1, max: 8 },
  inicio: { type: Date, required: true },
  fin: { type: Date, default: null },
}, { _id: false })

const loteSchema = new Schema({
  autoclaveId: { type: Number, required: true, enum: [1, 2] },
  lote: { type: String, required: true, trim: true },
  recetaId: { type: Number, required: true },
  estado: { type: Number, required: true, enum: [1, 2, 3] },
  faseActual: { type: Number, required: true, min: 0, max: 8 },
  timestampInicio: { type: Date, required: true },
  timestampFin: { type: Date, default: null },
  fases: { type: [faseItemSchema], default: [] },
}, { collection: 'lotes', versionKey: false })
loteSchema.index({ autoclaveId: 1, timestampInicio: -1 })
loteSchema.index({ autoclaveId: 1, estado: 1 })
loteSchema.index({ lote: 1 })

const telemetriaSchema = new Schema({
  timestamp: { type: Date, required: true },
  meta: {
    autoclaveId: { type: Number, required: true, enum: [1, 2] },
    loteId: { type: String, default: null },
  },
  temp1: Number,
  temp2: Number,
  presion: Number,
  fase: { type: Number, min: 0, max: 8 },
}, {
  collection: 'telemetria',
  versionKey: false,
  autoCreate: false,
  autoIndex: false,
  timeseries: { timeField: 'timestamp', metaField: 'meta', granularity: 'seconds' },
})

const faseRefSchema = new Schema({
  _id: { type: Number, required: true }, faseNum: Number, nombre: String, activo: Boolean,
}, { collection: 'refFases', versionKey: false, autoCreate: false, autoIndex: false })
const estadoRefSchema = new Schema({
  _id: { type: Number, required: true }, estadoId: Number, codigo: String, nombre: String, descripcion: String, color: String,
}, { collection: 'refEstados', versionKey: false, autoCreate: false, autoIndex: false })
const maquinaRefSchema = new Schema({
  _id: { type: Number, required: true }, autoclaveId: Number, codigo: String, nombre: String, descripcion: String, activo: Boolean,
}, { collection: 'refMaquinas', versionKey: false, autoCreate: false, autoIndex: false })

function getModel(name: string, schema: Schema): Model<any> {
  const existing = mongoose.models[name]
  return (existing as Model<any> | undefined) ?? mongoose.model(name, schema)
}

export const Lote = getModel('Lote', loteSchema)
export const Telemetria = getModel('Telemetria', telemetriaSchema)
export const RefFase = getModel('RefFase', faseRefSchema)
export const RefEstado = getModel('RefEstado', estadoRefSchema)
export const RefMaquina = getModel('RefMaquina', maquinaRefSchema)
