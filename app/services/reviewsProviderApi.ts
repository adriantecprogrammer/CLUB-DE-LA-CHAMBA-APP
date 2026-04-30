import axiosInstance from './axiosInstance'
import type { IReviewsProvider } from '~/interfaces/IReviews'

const reviewsProviderApi = {
  async getReviewsProviderByUser(
    providerId: string
  ): Promise<IReviewsProvider[]> {
    const response = await axiosInstance.get(`/reviews/${providerId}`)
    return response.data
  }
}

export default reviewsProviderApi
