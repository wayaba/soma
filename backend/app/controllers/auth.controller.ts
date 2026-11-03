import type { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { secret } from '../config/auth.config.js'
import db from '../models/index.js'

const User = db.user
const Role = db.role

type SignupBody = { username: string; email: string; password: string; roles?: string[] }
type SigninBody = { username: string; password: string }

export async function signup(req: Request<Record<string, never>, unknown, SignupBody>, res: Response) {
  try {
    const roleNames = req.body.roles ?? ['user']
    const roles = await Role.find({ name: { $in: roleNames } })
    if (roles.length !== roleNames.length) return res.status(400).json({ message: 'Uno o más roles no existen.' })
    await User.create({
      username: req.body.username,
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password, 8),
      roles: roles.map((role) => role._id),
    })
    return res.json({ message: 'Usuario registrado exitosamente!' })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error al registrar usuario'
    return res.status(500).json({ message })
  }
}

export async function signin(req: Request<Record<string, never>, unknown, SigninBody>, res: Response) {
  try {
    const user = await User.findOne({ username: req.body.username }).exec()
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado.' })
    if (!bcrypt.compareSync(req.body.password, user.password)) {
      return res.status(401).json({ accessToken: null, message: 'Clave inválida!' })
    }
    const accessToken = jwt.sign({ id: user.id }, secret, { expiresIn: 86400 })
    const roles = await Role.find({ _id: { $in: user.roles } }).select('name').lean()
    const authorities = roles.map((role) => `ROLE_${role.name.toUpperCase()}`)
    return res.status(200).json({ id: user._id, username: user.username, email: user.email, roles: authorities, accessToken })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error al iniciar sesión'
    return res.status(500).json({ message })
  }
}

export function loggedIn(req: Request, res: Response) {
  try {
    const token = req.header('x-access-token')
    if (!token) return res.json(false)
    jwt.verify(token, secret)
    return res.json(true)
  } catch {
    return res.json(false)
  }
}
