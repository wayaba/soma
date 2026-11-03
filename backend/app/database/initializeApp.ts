import { initializeDatabase } from './initializeDatabase.js'
import { seedAuth } from './seeds/seedAuth.js'

/** Runs one-time application setup after MongoDB is connected. */
export async function initializeApp() {
  await initializeDatabase()
  await seedAuth()
}
