import express from 'express'
import cors from 'cors'
import swaggerUi from 'swagger-ui-express'
import type { JsonObject } from 'swagger-ui-express'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { connectDatabase } from './database.js'
import { initializeApp } from './app/database/initializeApp.js'
import authRoutes from './app/routes/auth.routes.js'
import userRoutes from './app/routes/user.routes.js'
import autoclavesRoutes from './app/routes/autoclaves.routes.js'

const app = express()
const port = Number(process.env.PORT ?? 5000)
const swaggerPath = fileURLToPath(new URL('../swagger.json', import.meta.url))
const swaggerDocument = JSON.parse(readFileSync(swaggerPath, 'utf8')) as JsonObject

app.use(cors({ allowedHeaders: ['x-access-token', 'Origin', 'Content-Type', 'Accept'] }))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.get('/api-docs.json', (_req, res) => res.json(swaggerDocument))
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, {
  swaggerOptions: { persistAuthorization: true },
}))
app.get('/', (_req, res) => res.json({ message: 'SOMA backend is running.' }))

authRoutes(app)
userRoutes(app)
autoclavesRoutes(app)

async function startServer() {
  try {
    await connectDatabase()
    await initializeApp()
    app.listen(port, () => console.log(`SOMA backend escuchando en el puerto ${port}.`))
  } catch (error) {
    console.error('No se pudo iniciar SOMA backend:', error)
    process.exitCode = 1
  }
}

void startServer()
