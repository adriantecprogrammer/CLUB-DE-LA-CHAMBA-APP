import axiosInstance from './axiosInstance'
import type { IRequests, IRequestsCreate } from '~/interfaces/IRequests'

const requestClientApi = {
  async getRequestByUserId(clientId: string): Promise<IRequests[]> {
    const response = await axiosInstance.get<IRequests[]>(
      `/request/client/${clientId}`
    )

    return response.data
  },
  async createRequest(data: IRequestsCreate) {
    const response = await axiosInstance.post<IRequestsCreate>(
      `/request/new`,
      data
    )

    return response.data
  },
  async getRequestById(requestId: string): Promise<IRequests> {
    const response = await axiosInstance.get<IRequests>(
      `/request/${requestId}`
    )

    return response.data
  }
}

export default requestClientApi
