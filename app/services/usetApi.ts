import axiosInstance from './axiosInstance'
import type { IUser } from '~/interfaces/IUser'

const userApi = {
  async getUserById(id: string): Promise<IUser> {
    const response = await axiosInstance.get<IUser>(`/users/${id}`)
    return response.data
  }
}
export default userApi
