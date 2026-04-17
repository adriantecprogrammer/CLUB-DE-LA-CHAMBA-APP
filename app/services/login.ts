import axiosInstance from './axiosInstance'
import type { ILogin } from '~/interfaces/Ilogin'

const loginApi = {
  login: async (email: string, password: string) => {
    const response = await axiosInstance.post<ILogin>('/login', {
      email,
      password
    })
    return response.data
  }
}

export default loginApi
