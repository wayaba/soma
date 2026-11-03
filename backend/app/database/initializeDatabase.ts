import db from '../models/index.js'

/** Creates application indexes after establishing the MongoDB connection. */
export async function initializeDatabase() {
  await db.lote.createIndexes()
}
