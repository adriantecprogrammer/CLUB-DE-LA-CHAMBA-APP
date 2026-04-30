export interface IRequestsProvider {
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
