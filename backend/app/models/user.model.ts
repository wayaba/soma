import mongoose, { Schema, type Model, type Types } from 'mongoose'

export interface UserDocument {
  _id: Types.ObjectId
  username: string
  email: string
  password: string
  roles: Types.ObjectId[]
}

const userSchema = new Schema({
  username: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true, lowercase: true },
  password: { type: String, required: true },
  roles: [{ type: Schema.Types.ObjectId, ref: 'Role' }],
}, { collection: 'users', timestamps: true })

const User: Model<any> = (mongoose.models.User as Model<any> | undefined)
  ?? mongoose.model('User', userSchema)

export default User
