import bcrypt from 'bcryptjs'
import db from '../../models/index.js'

const initialRoles = ['user', 'moderator', 'admin'] as const

/** Idempotently creates required auth roles and the initial admin on an empty users collection. */
export async function seedAuth() {
  await Promise.all(initialRoles.map((name) => db.role.updateOne(
    { name },
    { $setOnInsert: { name } },
    { upsert: true },
  )))

  if (await db.user.estimatedDocumentCount() > 0) return

  const adminRole = await db.role.findOne({ name: 'admin' })
  if (!adminRole) throw new Error('No se pudo inicializar el rol admin.')

  await db.user.create({
    username: 'admin',
    email: 'admin@admin.com',
    password: bcrypt.hashSync('admin', 8),
    roles: [adminRole._id],
  })
  console.log('Usuario administrador inicial creado.')
}
