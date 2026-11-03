import mongoose from 'mongoose'
import User from './user.model.js'
import Role from './role.model.js'
import { Lote, Telemetria, RefFase, RefEstado, RefMaquina } from './autoclave.model.js'
const db = { mongoose, user: User, role: Role, lote: Lote, telemetria: Telemetria, refFase: RefFase, refEstado: RefEstado, refMaquina: RefMaquina }

export default db
