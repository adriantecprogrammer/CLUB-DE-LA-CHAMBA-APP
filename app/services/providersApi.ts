import axiosInstance from './axiosInstance'
import type { IProviderCreate } from '~/interfaces/IProvider'

const providersApi = {
  async createProvider(provider: IProviderCreate): Promise<IProviderCreate> {
    const response = await axiosInstance.post<IProviderCreate>(
      '/providers/create',
      provider
    )
    return response.data
  }
}

export default providersApi
