export type PaymentStatus = 'pending' | 'processing' | 'succeeded' | 'failed'

export interface IPaymentCreate {
  requestId: string
  clientId: string
  providerId: string
  amount: number
  currency: string
}

export interface IPayment {
  id: string
  requestId: string
  clientId: string
  providerId: string
  amount: number
  platformFee: number
  netAmount: number
  currency: string
  status: PaymentStatus
  cardLast4: string
  createdAt: string
}
