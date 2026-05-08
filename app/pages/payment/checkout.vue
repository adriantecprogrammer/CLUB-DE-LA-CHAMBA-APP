<script setup lang="ts">
import paymentApi from '~/services/paymentApi'

definePageMeta({ middleware: ['auth'] })

const route = useRoute()
const router = useRouter()
const toast = useToast()

const requestId = route.query.requestId as string
const providerId = route.query.providerId as string
const amount = Number(route.query.amount) || 0

const { loading, error, validateCard, reset } = usePayment()
const cardNumber = ref('')
const expiry = ref('')
const cvv = ref('')
const paymentComplete = ref(false)

const formattedAmount = computed(() => {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(amount)
})

const canPay = computed(() => {
  return cardNumber.value.replace(/\s/g, '').length === 16
    && expiry.value.length === 5
    && cvv.value.length >= 3
})

async function handlePay() {
  reset()
  if (!validateCard(cardNumber.value, expiry.value, cvv.value)) return

  const { user } = useAuth()
  loading.value = true

  try {
    await paymentApi.processPayment({
      requestId,
      clientId: user.value!.id,
      providerId,
      amount,
      currency: 'mxn',
      cardLast4: cardNumber.value.slice(-4)
    })
    paymentComplete.value = true
    toast.add({ title: 'Pago exitoso', description: 'Tu pago fue procesado correctamente', color: 'success' })
  } catch (err) {
    console.error('Error al procesar pago:', err)
    toast.add({ title: 'Error', description: 'No se pudo procesar el pago', color: 'error' })
  } finally {
    loading.value = false
  }
}

function handleBack() {
  if (paymentComplete.value) {
    router.push(`/solicitudes/${requestId}`)
  } else {
    router.back()
  }
}
</script>

<template>
  <div class="bg-[#f6f7f8] min-h-screen font-[Manrope,sans-serif]">
    <!-- Header -->
    <header class="sticky top-0 z-20 bg-[#f6f7f8] flex items-center justify-between px-4 py-3">
      <button
        class="size-10 rounded-full flex items-center justify-center"
        @click="handleBack"
      >
        <UIcon
          name="i-lucide-arrow-left"
          class="size-4 text-[#0f172a]"
        />
      </button>
      <h1 class="text-[18px] font-bold text-[#0f172a] tracking-[-0.27px]">
        Pagar Servicio
      </h1>
      <div class="size-10" />
    </header>

    <div class="flex flex-col gap-4 p-4 pb-[140px]">
      <!-- Summary -->
      <div class="bg-white rounded-xl border border-[#f1f5f9] p-5 shadow-[0px_1px_1px_rgba(0,0,0,0.05)]">
        <h3 class="text-[14px] font-medium text-[#64748b] uppercase tracking-[0.6px] mb-3">
          Resumen del Pago
        </h3>
        <div class="flex items-center justify-between">
          <span class="text-[16px] text-[#0f172a]">Total del servicio</span>
          <span class="text-[20px] font-bold text-[#0f172a]">{{ formattedAmount }}</span>
        </div>
        <div class="mt-3 pt-3 border-t border-[#f1f5f9]">
          <div class="flex items-center gap-2 text-[13px] text-[#64748b]">
            <UIcon
              name="i-lucide-shield-check"
              class="size-4 text-green-600"
            />
            <span>Pago seguro</span>
          </div>
        </div>
      </div>

      <!-- Payment form or success -->
      <div
        v-if="!paymentComplete"
        class="bg-white rounded-xl border border-[#f1f5f9] p-5 shadow-[0px_1px_1px_rgba(0,0,0,0.05)]"
      >
        <h3 class="text-[14px] font-medium text-[#64748b] uppercase tracking-[0.6px] mb-4">
          Datos de Tarjeta
        </h3>
        <PaymentForm
          v-model:card-number="cardNumber"
          v-model:expiry="expiry"
          v-model:cvv="cvv"
        />
        <p
          v-if="error"
          class="mt-3 text-[13px] text-red-500"
        >
          {{ error }}
        </p>
      </div>

      <div
        v-else
        class="bg-white rounded-xl border border-[#f1f5f9] p-8 shadow-[0px_1px_1px_rgba(0,0,0,0.05)] flex flex-col items-center gap-4"
      >
        <div class="size-16 rounded-full bg-green-50 flex items-center justify-center">
          <UIcon
            name="i-lucide-check"
            class="size-8 text-green-600"
          />
        </div>
        <h3 class="text-[18px] font-bold text-[#0f172a]">
          Pago Completado
        </h3>
        <p class="text-[14px] text-[#64748b] text-center">
          Tu pago de {{ formattedAmount }} fue procesado exitosamente.
        </p>
        <button
          class="mt-2 w-full h-12 bg-[#136dec] rounded-xl flex items-center justify-center text-[16px] font-bold text-white"
          @click="router.push(`/solicitudes/${requestId}`)"
        >
          Volver al Inicio
        </button>
      </div>
    </div>

    <!-- Bottom pay button -->
    <div
      v-if="!paymentComplete"
      class="fixed bottom-0 left-0 right-0 z-20 bg-white border-t border-[#f1f5f9] pt-[17px] pb-8 px-4 shadow-[0px_-4px_6px_-1px_rgba(0,0,0,0.05)]"
    >
      <button
        class="w-full h-12 bg-[#136dec] rounded-xl flex items-center justify-center gap-2 shadow-[0px_10px_15px_-3px_rgba(19,109,236,0.3),0px_4px_6px_-4px_rgba(19,109,236,0.3)] transition active:scale-[0.98] disabled:opacity-50"
        :disabled="loading || !canPay"
        @click="handlePay"
      >
        <div
          v-if="loading"
          class="size-5 border-2 border-white border-t-transparent rounded-full animate-spin"
        />
        <template v-else>
          <span class="text-[16px] font-bold text-white">Pagar {{ formattedAmount }}</span>
          <UIcon
            name="i-lucide-lock"
            class="size-[13px] text-white"
          />
        </template>
      </button>
    </div>
  </div>
</template>
