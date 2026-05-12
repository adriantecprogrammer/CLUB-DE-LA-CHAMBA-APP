export interface IReviewsProvider {
  id: string
  requestId: string
  clientId: string
  providerId: string
  rating: number
  comment: string
  createdAt: string
}

export interface IReviewsCreate {
  requestId: string
  clientId: string
  providerId: string
  rating: number
  comment: string
}
