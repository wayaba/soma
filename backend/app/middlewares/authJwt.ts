import type { NextFunction, Request, Response } from 'express'
import jwt, { type JwtPayload } from 'jsonwebtoken'
import db from '../models/index.js'
import { secret } from '../config/auth.config.js'

export interface AuthenticatedRequest extends Request { userId?: string }

export function verifyToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const token = req.header('x-access-token')
  if (!token) return res.status(403).json({ message: 'No token provided!' })
  try {
    const decoded = jwt.verify(token, secret) as JwtPayload
    if (typeof decoded.id !== 'string') return res.status(401).json({ message: 'Unauthorized!' })
    req.userId = decoded.id
    return next()
  } catch {
    return res.status(401).json({ message: 'Unauthorized!' })
  }
}

async function hasRole(req: AuthenticatedRequest, res: Response, next: NextFunction, roleName: string) {
  try {
    const user = await db.user.findById(req.userId).populate('roles', 'name')
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado.' })
    const roles = user.roles as unknown as Array<{ name: string }>
    if (!roles.some((role) => role.name === roleName)) return res.status(403).json({ message: `Require ${roleName} role!` })
    return next()
  } catch (error) {
    console.error('Error al verificar rol:', error)
    return res.status(500).json({ message: 'Error al verificar permisos.' })
  }
}

export const isAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction) => hasRole(req, res, next, 'admin')
export const isModerator = (req: AuthenticatedRequest, res: Response, next: NextFunction) => hasRole(req, res, next, 'moderator')

const authJwt = { verifyToken, isAdmin, isModerator }
export default authJwt
