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
