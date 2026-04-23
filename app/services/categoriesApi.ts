import axiosInstance from './axiosInstance'
import type {
  ICategoriesProviderAdd,
  ICategories
} from '~/interfaces/ICategories'

const categoriesApi = {
  addCategoriesToProvider: async (providerId: string, categories: ICategoriesProviderAdd) => {
    const response = await axiosInstance.post(`/providers/${providerId}/categories`, categories)
    return response.data
  },
  getCategories: async (): Promise<ICategories[]> => {
    const response = await axiosInstance.get('/categories/all')
    return response.data
  }
}

export default categoriesApi
