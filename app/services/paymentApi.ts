import axiosInstance from './axiosInstance'
import type { IPaymentCreate, IPayment } from '~/interfaces/IPayments'

const paymentApi = {
  processPayment: async (data: IPaymentCreate & { cardLast4: string }): Promise<IPayment> => {
    const response = await axiosInstance.post('/payments/process', data)
    return response.data
  }
}

export default paymentApi
