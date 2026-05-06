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

function onTouchStart(e: TouchEvent) {
  if (isAccepted.value || loading.value) return
  isDragging.value = true
  startX.value = e.touches[0].clientX - offsetX.value
}

function onTouchMove(e: TouchEvent) {
  if (!isDragging.value) return
  const diff = e.touches[0].clientX - startX.value
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
  <div
    v-if="!isAccepted"
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
      <!-- Thumb circle -->
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

      <p class="ml-4 text-[14px] font-semibold text-[#475569]">
        Desliza para aceptar esta solicitud
      </p>
    </div>
  </div>

  <!-- Success state -->
  <div
    v-else
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
</template>
