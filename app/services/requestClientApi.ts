import axiosInstance from './axiosInstance'
import type { IRequests } from '~/interfaces/IRequests'

const requestClientApi = {
  async getRequestByUserId(clientId: string): Promise<IRequests[]> {
    const response = await axiosInstance.get<IRequests[]>(
      `/request/client/${clientId}`
    )

    return response.data
  }
}

export default requestClientApi
