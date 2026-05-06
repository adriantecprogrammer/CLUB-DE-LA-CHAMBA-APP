import axiosInstance from './axiosInstance'
import type { IRequestsProvider } from '~/interfaces/IRequestProvider'

const requestsProviderApi = {
  async getRequestsProvidersByUser(
    providerId: string
  ): Promise<IRequestsProvider[]> {
    const response = await axiosInstance.get(
      `request/provider/${providerId}/jobs`
    )
    return response.data
  },

  async acceptRequest(
    providerId: string,
    requestId: string
  ): Promise<IRequestsProvider> {
    const response = await axiosInstance.put(`/request/${requestId}/accept`, {
      providerId: providerId
    })
    return response.data
  }
}
export default requestsProviderApi
