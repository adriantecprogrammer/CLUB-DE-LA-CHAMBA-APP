import axiosInstance from './axiosInstance'
import type { IProviderCreate, IProviderCreateResponse, IProviders } from '~/interfaces/IProvider'

const providersApi = {
  async createProvider(provider: IProviderCreate): Promise<IProviderCreateResponse> {
    const response = await axiosInstance.post<IProviderCreateResponse>(
      '/providers/create',
      provider
    )
    return response.data
  },

  async getAllProviders(): Promise<IProviders[]> {
    const response = await axiosInstance.get<IProviders[]>('/providers/all')
    return response.data
  }

}

export default providersApi
