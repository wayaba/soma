export type LoginErrors = {
  username?: string
  password?: string
}

export interface Role {
  _id?: string
  name: string
}

export interface User {
  id?: string
  username: string
  email: string
  password?: string
  accessToken?: string
  roles?: Role[]
}
