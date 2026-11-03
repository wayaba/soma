import type { Express } from 'express'
import middlewares from '../middlewares/index.js'
import { getAll } from '../controllers/user.controller.js'

export default function userRoutes(app: Express) {
  app.get('/api/users', middlewares.authJwt.verifyToken, getAll)
}
