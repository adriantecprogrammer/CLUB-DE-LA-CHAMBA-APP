<script setup lang="ts">
import requestsProviderApi from '~/services/requestsProviderApi'

const props = defineProps<{
  requestId: string
  providerId: string
  disabled?: boolean
}>()

const emit = defineEmits<{
  accepted: []
  error: []
}>()

const toast = useToast()
const offsetX = ref(0)
const isDragging = ref(false)
const isAccepted = ref(false)
const loading = ref(false)
const startX = ref(0)
const SWIPE_THRESHOLD = 200

const priceInput = ref('')
const priceConfirmed = ref(false)

const numericPrice = computed(() => Number(priceInput.value) || 0)

function confirmPrice() {
  if (numericPrice.value <= 0) return
  priceConfirmed.value = true
}

function onTouchStart(e: TouchEvent) {
  if (isAccepted.value || loading.value) return
  isDragging.value = true
  startX.value = e.touches[0]!.clientX - offsetX.value
}

function onTouchMove(e: TouchEvent) {
  if (!isDragging.value) return
  const diff = e.touches[0]!.clientX - startX.value
  offsetX.value = Math.max(0, Math.min(diff, 300))
}

function onTouchEnd() {
  isDragging.value = false
  if (offsetX.value > SWIPE_THRESHOLD) {
    acceptRequest()
  } else {
    offsetX.value = 0
  }
}

async function acceptRequest() {
  if (isAccepted.value || loading.value) return
  loading.value = true
  isAccepted.value = true
  offsetX.value = 300
  try {
    await requestsProviderApi.acceptRequest(props.providerId, props.requestId)
    toast.add({ title: 'Solicitud aceptada', description: 'El cliente será notificado', color: 'success' })
    emit('accepted')
  } catch (err) {
    console.error('Error al aceptar solicitud:', err)
    toast.add({ title: 'Error al aceptar', description: 'No se pudo aceptar la solicitud', color: 'error' })
    isAccepted.value = false
    offsetX.value = 0
    emit('error')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <!-- Success state -->
  <div
    v-if="isAccepted"
    class="bg-emerald-500 rounded-2xl px-5 py-4 flex items-center gap-3"
  >
    <UIcon
      name="i-lucide-check-circle-2"
      class="size-6 text-white"
    />
    <div>
      <p class="text-[16px] font-bold text-white">
        Solicitud aceptada
      </p>
      <p class="text-[13px] text-emerald-100">
        El cliente será notificado
      </p>
    </div>
  </div>

  <!-- Step 1: Price input -->
  <div
    v-else-if="!priceConfirmed"
    class="bg-white border border-[#f1f5f9] rounded-2xl p-5 shadow-[0px_1px_1px_rgba(0,0,0,0.05)]"
  >
    <h3 class="text-[14px] font-medium text-[#64748b] uppercase tracking-[0.6px] mb-4">
      Precio Estimado
    </h3>
    <div class="relative mb-4">
      <span class="absolute left-4 top-1/2 -translate-y-1/2 text-[16px] font-bold text-[#64748b]">$</span>
      <input
        v-model="priceInput"
        type="number"
        inputmode="numeric"
        min="1"
        placeholder="0.00"
        class="w-full h-12 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl pl-9 pr-4 text-[18px] font-bold text-[#0f172a] placeholder-[#94a3b8] focus:outline-none focus:ring-2 focus:ring-[#136dec]/20 focus:border-[#136dec]"
      >
    </div>
    <button
      class="w-full h-11 bg-[#136dec] rounded-xl flex items-center justify-center text-[14px] font-bold text-white transition active:scale-[0.98] disabled:opacity-40"
      :disabled="numericPrice <= 0"
      @click="confirmPrice"
    >
      Confirmar Precio
    </button>
  </div>

  <!-- Step 2: Swipe to accept -->
  <div
    v-else
    class="relative overflow-hidden rounded-2xl"
  >
    <!-- Track background -->
    <div class="absolute inset-0 bg-emerald-500 flex items-center px-6 z-0">
      <div class="flex items-center gap-2 text-white">
        <UIcon
          name="i-lucide-check-circle"
          class="size-6"
        />
        <span class="text-[16px] font-bold">Aceptar solicitud</span>
      </div>
    </div>

    <!-- Draggable thumb -->
    <div
      class="relative z-10 flex items-center bg-white border border-[#f1f5f9] rounded-2xl px-5 py-4 select-none"
      :class="{ 'transition-transform': !isDragging }"
      :style="{ transform: `translateX(${offsetX}px)` }"
      @touchstart="onTouchStart"
      @touchmove.prevent="onTouchMove"
      @touchend="onTouchEnd"
    >
      <div
        class="size-12 rounded-full flex items-center justify-center shrink-0"
        :class="offsetX > 50 ? 'bg-emerald-500' : 'bg-[#f1f5f9]'"
      >
        <UIcon
          v-if="loading"
          name="i-lucide-loader-2"
          class="size-5 animate-spin text-white"
        />
        <UIcon
          v-else-if="offsetX > 50"
          name="i-lucide-check"
          class="size-5 text-white"
        />
        <UIcon
          v-else
          name="i-lucide-arrow-right"
          class="size-5 text-neutral-400"
        />
      </div>

      <div class="ml-4 flex-1">
        <p class="text-[14px] font-semibold text-[#475569]">
          Desliza para aceptar
        </p>
        <p class="text-[13px] text-[#136dec] font-bold">
          ${{ numericPrice }} MXN
        </p>
      </div>
    </div>
  </div>
</template>
