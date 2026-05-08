<script setup lang="ts">
import requestsProviderApi from '~/services/requestsProviderApi'

const props = defineProps<{
  requestId: string
}>()

const emit = defineEmits<{
  started: []
  error: []
}>()

const toast = useToast()
const offsetX = ref(0)
const isDragging = ref(false)
const isStarted = ref(false)
const loading = ref(false)
const startX = ref(0)
const SWIPE_THRESHOLD = 200

function onTouchStart(e: TouchEvent) {
  if (isStarted.value || loading.value) return
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
    startRequest()
  } else {
    offsetX.value = 0
  }
}

async function startRequest() {
  if (isStarted.value || loading.value) return
  loading.value = true
  isStarted.value = true
  offsetX.value = 300
  try {
    await requestsProviderApi.startRequest(props.requestId)
    toast.add({ title: 'Servicio iniciado', description: 'El cliente será notificado', color: 'success' })
    emit('started')
  } catch (err) {
    console.error('Error al iniciar solicitud:', err)
    toast.add({ title: 'Error', description: 'No se pudo iniciar la solicitud', color: 'error' })
    isStarted.value = false
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
    v-if="isStarted"
    class="bg-[#136dec] rounded-2xl px-5 py-4 flex items-center gap-3"
  >
    <UIcon
      name="i-lucide-play-circle"
      class="size-6 text-white"
    />
    <div>
      <p class="text-[16px] font-bold text-white">
        Servicio iniciado
      </p>
      <p class="text-[13px] text-blue-200">
        El cliente será notificado
      </p>
    </div>
  </div>

  <!-- Swipe to start -->
  <div
    v-else
    class="relative overflow-hidden rounded-2xl"
  >
    <!-- Track background -->
    <div class="absolute inset-0 bg-[#136dec] flex items-center px-6 z-0">
      <div class="flex items-center gap-2 text-white">
        <UIcon
          name="i-lucide-play"
          class="size-6"
        />
        <span class="text-[16px] font-bold">Iniciar servicio</span>
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
        :class="offsetX > 50 ? 'bg-[#136dec]' : 'bg-[#f1f5f9]'"
      >
        <UIcon
          v-if="loading"
          name="i-lucide-loader-2"
          class="size-5 animate-spin text-white"
        />
        <UIcon
          v-else-if="offsetX > 50"
          name="i-lucide-play"
          class="size-5 text-white"
        />
        <UIcon
          v-else
          name="i-lucide-arrow-right"
          class="size-5 text-neutral-400"
        />
      </div>

      <p class="ml-4 text-[14px] font-semibold text-[#475569]">
        Desliza para iniciar el servicio
      </p>
    </div>
  </div>
</template>
