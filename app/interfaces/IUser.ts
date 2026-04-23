export interface IUserCreate {
  firstName: string
  lastName: string
  email: string
  passwordHash: string
  phone: string
  role: 'client' | 'provider'
}

export interface IUserCreateResponse {
  message: string
  id: string
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
