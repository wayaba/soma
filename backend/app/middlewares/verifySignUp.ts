import type { NextFunction, Request, Response } from 'express'
import db from '../models/index.js'

type SignupRequest = Request<Record<string, never>, unknown, { username?: string; email?: string; roles?: string[] }>
const allowedRoles = ['user', 'moderator', 'admin']

export async function checkDuplicateUsernameOrEmail(req: SignupRequest, res: Response, next: NextFunction) {
  try {
    const { username, email } = req.body
    if (!username || !email) return res.status(400).json({ message: 'username y email son obligatorios.' })
    if (await db.user.exists({ username })) return res.status(400).json({ message: 'Error! Usuario ya en uso!' })
    if (await db.user.exists({ email })) return res.status(400).json({ message: 'Error! Correo ya en uso!' })
    return next()
  } catch (error) {
    console.error('Error al validar usuario:', error)
    return res.status(500).json({ message: 'Error al validar usuario.' })
  }
}

export function checkRolesExisted(req: SignupRequest, res: Response, next: NextFunction) {
  const { roles } = req.body
  if (roles !== undefined && (!Array.isArray(roles) || roles.some((role) => !allowedRoles.includes(role)))) {
    return res.status(400).json({ message: 'roles debe contener roles válidos.' })
  }
  return next()
}

const verifySignUp = { checkDuplicateUsernameOrEmail, checkRolesExisted }
export default verifySignUp
