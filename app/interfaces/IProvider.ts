export interface IProviderCreate {
  userId: string
  bio: string
  experienceYears: number
  verified: number
}

export interface IProviderCreateResponse {
  message: string
  id: string
}
