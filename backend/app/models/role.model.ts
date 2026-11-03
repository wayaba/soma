import mongoose, { Schema, type Model, type Types } from 'mongoose'

export interface RoleDocument { _id: Types.ObjectId; name: 'user' | 'moderator' | 'admin' }

const roleSchema = new Schema({
  name: { type: String, required: true, unique: true, enum: ['user', 'moderator', 'admin'] },
}, { collection: 'roles' })

const Role: Model<any> = (mongoose.models.Role as Model<any> | undefined)
  ?? mongoose.model('Role', roleSchema)

export default Role
