import type { Express } from 'express'
import middlewares from '../middlewares/index.js'
import {
  getCurvaLote, getEstadoActual, getReporteLote, getLotes,
  getReferenciasAutoclaves, getFases, getEstados, getMaquinas,
} from '../controllers/autoclaves.controller.js'

const auth = middlewares.authJwt.verifyToken

export default function autoclavesRoutes(app: Express) {
  app.get('/api/lotes', auth, getLotes)
  app.get('/api/lotes/:loteId/curva', auth, getCurvaLote)
  app.get('/api/lotes/:loteId/reporte', auth, getReporteLote)
  app.get('/api/autoclaves/estado-actual', auth, getEstadoActual)
  app.get('/api/autoclaves/referencias', auth, getReferenciasAutoclaves)
  app.get('/api/refFases', auth, getFases)
  app.get('/api/refEstados', auth, getEstados)
  app.get('/api/refMaquinas', auth, getMaquinas)
}
