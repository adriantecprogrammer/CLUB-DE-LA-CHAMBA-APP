import axiosInstance from './axiosInstance'
import type { IUserCreate, IUserCreateResponse } from '~/interfaces/IUser'

const registerApi = {
  registerUser: async (user: IUserCreate) => {
    const response = await axiosInstance.post<IUserCreateResponse>('/users/register', user)
    return response.data
  }
}

export default registerApi
