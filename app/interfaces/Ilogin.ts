export interface ILogin {
  token: string
  user: IUser
  provider: null
}

export interface IUser {
  id: string
  firstName: string
  lastName: string
  email: string
  passwordHash: string
  phone: string
  role: string
  avatarUrl: null
  isActive: number
  createdAt: string
  updatedAt: string
  deletedAt: null
}

export interface ILoginRequest {
  email: string
  passwordHash: string
}
