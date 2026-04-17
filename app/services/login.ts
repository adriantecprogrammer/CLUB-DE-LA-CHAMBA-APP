import axiosInstance from './axiosInstance';
import type { ILogin, ILoginRequest } from '~/interfaces/Ilogin';


const loginApi = {
  login: async (loginRequest: ILoginRequest) => {
    const response = await axiosInstance.post<ILogin>('/users/login', {
      email: loginRequest.email,
      passwordHash: loginRequest.passwordHash,
    });
    return response.data;
  },
};

export default loginApi;
