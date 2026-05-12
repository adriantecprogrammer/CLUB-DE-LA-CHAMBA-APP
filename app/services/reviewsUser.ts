import axiosInstance from './axiosInstance'
import type { IReviewsCreate } from '~/interfaces/IReviews'

const reviewsUserApi = {

  async createReview(review: IReviewsCreate): Promise<IReviewsCreate> {
    const response = await axiosInstance.post<IReviewsCreate>('/reviews/add', review)
    return response.data
  }
}
export default reviewsUserApi