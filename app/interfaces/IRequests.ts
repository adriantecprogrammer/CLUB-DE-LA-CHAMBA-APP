export interface IRequests {
  id: string
  clientId: string
  providerId: null | string
  categoryId: string
  title: string
  description: string
  locationAddress: string
  locationLat: number
  locationLng: number
  status: string
  scheduledAt: null | string
  estimatedPrice: number
  finalPrice: null | number
  createdAt: string
  updatedAt: string
  completedAt: null | string
}

export interface IProviderJobs {
  id: string
  clientId: string
  providerId: string
  categoryId: string
  title: string
  description: string
  locationAddress: string
  locationLat: number
  locationLng: number
  status: string
  scheduledAt: string
  estimatedPrice: number
  finalPrice: number
  createdAt: string
  updatedAt: string
  completedAt: string
}
