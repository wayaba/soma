import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { existsSync } from 'node:fs'
import mongoose from 'mongoose'

const envPath = fileURLToPath(new URL('../.env', import.meta.url))
if (existsSync(envPath)) process.loadEnvFile(envPath)

export async function connectDatabase() {
  const uri = process.env.MONGODB_URI
  if (!uri) throw new Error('Falta configurar MONGODB_URI en el entorno del backend.')
  await mongoose.connect(uri)
  console.log(`MongoDB conectado: ${mongoose.connection.host}/${mongoose.connection.name}`)
}

export default mongoose
