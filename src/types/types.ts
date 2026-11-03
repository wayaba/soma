export interface Alarma {
  _id?: string
  idLoteFab: string
  idLoteCip: string
  alarmas: number[]
  fecha: string | Date
}
export interface Receta {
  _id?: string
  idLote: string
  lote: string
  receta: string
  usuario: string
  pesoFinal: number
  fechaInicio: string | Date
  fechaFin: string | Date
  tipoLimpieza?: string
  equipo?: string
  pasos?: PasoReceta[]
}

export interface Variable {
  idLote: string
  temperatura?: number
  peso?: number
  presion?: number
  agitacion?: number
  timestamp?: string | Date
}

export interface Funcion {
  idFuncion?: number
  texto?: string
}

export interface RefAlarma {
  idAlarma?: number
  texto?: string
}

export interface PasoReceta {
  _id?: string
  num: number
  func: number
  spPresion?: number
  spTemp?: number
  spCarga?: number
  spAgit?: number
  spDosif?: number
  spTiempo?: number
  pvTemperatura?: number
  pvPeso?: number
  pvPresion?: number
  pvAgitacion?: number
  fechaFin?: string | Date
}

export type LoginErrors = {
  username?: string
  password?: string
}

export interface Role {
  _id?: string
  name: string
}

export interface User {
  id?: string
  username: string
  email: string
  password?: string
  accessToken?: string
  roles?: Role[]
}
