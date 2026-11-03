import type { Request, Response } from 'express'
import db from '../models/index.js'

export async function getAll(_req: Request, res: Response) {
  try {
    const users = await db.user.find().select('-password').populate('roles', 'name').lean()
    return res.json(users)
  } catch (error) {
    console.error('Error al listar usuarios:', error)
    return res.status(500).json({ error: 'Error al listar usuarios' })
  }
}
