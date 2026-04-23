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

export interface IProviders {
  id: string
  userId: string
  bio: string
  experienceYears: number
  verified: number
  ratingAvg: number
  ratingCount: number
  completedJobs: number
  createdAt: string
  updatedAt: string
}
