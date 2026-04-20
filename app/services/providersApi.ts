import axiosInstance from './axiosInstance'
import type { IProviderCreate, IProviderCreateResponse } from '~/interfaces/IProvider'

const providersApi = {
  async createProvider(provider: IProviderCreate): Promise<IProviderCreateResponse> {
    const response = await axiosInstance.post<IProviderCreateResponse>(
      '/providers/create',
      provider
    )
    return response.data
  }
}

export default providersApi
