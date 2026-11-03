import type { Express } from 'express'
import middlewares from '../middlewares/index.js'
import { signup, signin, loggedIn } from '../controllers/auth.controller.js'

export default function authRoutes(app: Express) {
  app.post('/api/auth/signup', middlewares.verifySignUp.checkDuplicateUsernameOrEmail, middlewares.verifySignUp.checkRolesExisted, signup)
  app.post('/api/auth/signin', signin)
  app.get('/api/auth/loggedIn', loggedIn)
}
