import type { PaymentStatus } from '~/interfaces/IPayments'

export function usePayment() {
  const loading = ref(false)
  const error = ref<string | null>(null)
  const paymentStatus = ref<PaymentStatus>('pending')

  function validateCard(cardNumber: string, expiry: string, cvv: string): boolean {
    const cleanNumber = cardNumber.replace(/\s/g, '')
    if (!/^\d{16}$/.test(cleanNumber)) {
      error.value = 'Número de tarjeta inválido (16 dígitos)'
      return false
    }
    if (!/^\d{2}\/\d{2}$/.test(expiry)) {
      error.value = 'Fecha de expiración inválida (MM/AA)'
      return false
    }
    if (!/^\d{3,4}$/.test(cvv)) {
      error.value = 'CVV inválido'
      return false
    }
    return true
  }

  function formatCardNumber(value: string): string {
    const digits = value.replace(/\D/g, '').slice(0, 16)
    return digits.replace(/(\d{4})(?=\d)/g, '$1 ')
  }

  function formatExpiry(value: string): string {
    const digits = value.replace(/\D/g, '').slice(0, 4)
    if (digits.length >= 3) {
      return `${digits.slice(0, 2)}/${digits.slice(2)}`
    }
    return digits
  }

  function reset() {
    loading.value = false
    error.value = null
    paymentStatus.value = 'pending'
  }

  return {
    loading,
    error,
    paymentStatus: readonly(paymentStatus),
    validateCard,
    formatCardNumber,
    formatExpiry,
    reset
  }
}
