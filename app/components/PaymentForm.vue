<script setup lang="ts">
const cardNumber = defineModel<string>('cardNumber', { required: true })
const expiry = defineModel<string>('expiry', { required: true })
const cvv = defineModel<string>('cvv', { required: true })

const { formatCardNumber, formatExpiry } = usePayment()

function onCardInput(event: Event) {
  const input = event.target as HTMLInputElement
  cardNumber.value = formatCardNumber(input.value)
}

function onExpiryInput(event: Event) {
  const input = event.target as HTMLInputElement
  expiry.value = formatExpiry(input.value)
}

function onCvvInput(event: Event) {
  const input = event.target as HTMLInputElement
  cvv.value = input.value.replace(/\D/g, '').slice(0, 4)
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="flex flex-col gap-1.5">
      <label class="text-[13px] font-medium text-[#64748b]">Número de tarjeta</label>
      <div class="relative">
        <input
          :value="cardNumber"
          placeholder="1234 5678 9012 3456"
          inputmode="numeric"
          class="w-full h-11 bg-[#f8fafc] border border-[#e2e8f0] rounded-lg px-4 text-[15px] text-[#0f172a] placeholder-[#94a3b8] focus:outline-none focus:ring-2 focus:ring-[#136dec]/20 focus:border-[#136dec]"
          @input="onCardInput"
        >
        <UIcon
          name="i-lucide-credit-card"
          class="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-[#94a3b8]"
        />
      </div>
    </div>

    <div class="flex gap-3">
      <div class="flex flex-col gap-1.5 flex-1">
        <label class="text-[13px] font-medium text-[#64748b]">Expiración</label>
        <input
          :value="expiry"
          placeholder="MM/AA"
          inputmode="numeric"
          class="w-full h-11 bg-[#f8fafc] border border-[#e2e8f0] rounded-lg px-4 text-[15px] text-[#0f172a] placeholder-[#94a3b8] focus:outline-none focus:ring-2 focus:ring-[#136dec]/20 focus:border-[#136dec]"
          @input="onExpiryInput"
        >
      </div>
      <div class="flex flex-col gap-1.5 w-28">
        <label class="text-[13px] font-medium text-[#64748b]">CVV</label>
        <input
          :value="cvv"
          placeholder="123"
          inputmode="numeric"
          type="password"
          maxlength="4"
          class="w-full h-11 bg-[#f8fafc] border border-[#e2e8f0] rounded-lg px-4 text-[15px] text-[#0f172a] placeholder-[#94a3b8] focus:outline-none focus:ring-2 focus:ring-[#136dec]/20 focus:border-[#136dec]"
          @input="onCvvInput"
        >
      </div>
    </div>
  </div>
</template>
