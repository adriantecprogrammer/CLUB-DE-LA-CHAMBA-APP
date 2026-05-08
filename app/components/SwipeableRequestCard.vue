<script setup lang="ts">
import type { IRequestsProvider } from '~/interfaces/IRequestProvider'
import { RequestStatus, getStatusConfig } from '~/enums/requestStatus'

const props = defineProps<{
  request: IRequestsProvider
}>()

const emit = defineEmits<{
  accept: [requestId: string]
  view: [requestId: string]
  complete: [requestId: string]
  start: [requestId: string]
}>()

const offsetX = ref(0)
const isDragging = ref(false)
const didSwipe = ref(false)
const isDone = ref(false)
const startX = ref(0)
const SWIPE_THRESHOLD = 120

const canSwipeAccept = computed(() => props.request.status === RequestStatus.PENDING)
const canSwipeStart = computed(() => props.request.status === RequestStatus.ASSIGNED)
const canSwipe = computed(() => canSwipeAccept.value || canSwipeStart.value)

const swipeColor = computed(() => canSwipeStart.value ? 'bg-[#136dec]' : 'bg-emerald-500')

function onTouchStart(e: TouchEvent) {
  didSwipe.value = false
  if (!canSwipe.value || isDone.value) return
  isDragging.value = true
  startX.value = e.touches[0]!.clientX - offsetX.value
}

function onTouchMove(e: TouchEvent) {
  if (!isDragging.value || !canSwipe.value) return
  const diff = e.touches[0]!.clientX - startX.value
  if (Math.abs(diff) > 10) didSwipe.value = true
  offsetX.value = Math.max(0, Math.min(diff, 180))
}

function onTouchEnd() {
  isDragging.value = false
  if (offsetX.value > SWIPE_THRESHOLD) {
    handleSwipe()
  } else {
    offsetX.value = 0
  }
}

function handleTap() {
  if (!didSwipe.value && !isDone.value) {
    emit('view', props.request.id)
  }
}

async function handleSwipe() {
  if (isDone.value) return
  isDone.value = true
  offsetX.value = 180
  if (canSwipeAccept.value) {
    emit('accept', props.request.id)
  } else if (canSwipeStart.value) {
    emit('start', props.request.id)
  }
}

function statusLabel(status: string) {
  return getStatusConfig(status).label
}

function statusColor(status: string) {
  const config = getStatusConfig(status)
  return `${config.badgeBg} ${config.badgeColor}`
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('es-MX', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}

function formatPrice(price: number) {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN'
  }).format(price)
}
</script>

<template>
  <div
    class="relative overflow-hidden rounded-xl"
    @click="handleTap"
  >
    <!-- Background swipe action -->
    <div
      v-if="canSwipe && !isDone"
      class="absolute inset-0 rounded-xl flex items-center justify-end pr-5 z-0"
      :class="swipeColor"
    >
      <div class="flex items-center gap-2 text-white">
        <UIcon
          :name="canSwipeStart ? 'i-lucide-play' : 'i-lucide-check-circle'"
          class="size-5"
        />
        <span class="text-[14px] font-bold">
          {{ canSwipeStart ? 'Iniciar' : 'Aceptar' }}
        </span>
      </div>
    </div>

    <!-- Success overlay -->
    <div
      v-if="isDone"
      class="absolute inset-0 rounded-xl flex items-center justify-center z-20"
      :class="swipeColor"
    >
      <div class="flex items-center gap-2 text-white">
        <UIcon
          name="i-lucide-check-circle"
          class="size-6"
        />
        <span class="text-[16px] font-bold">
          {{ canSwipeStart ? 'Servicio iniciado' : 'Solicitud aceptada' }}
        </span>
      </div>
    </div>

    <!-- Card content -->
    <div
      class="relative z-10 bg-white border border-[#f3f4f6] rounded-xl p-4 transition-transform"
      :class="{ 'transition-none': isDragging }"
      :style="canSwipe && !isDone ? { transform: `translateX(${offsetX}px)` } : {}"
      @touchstart="onTouchStart"
      @touchmove.prevent="onTouchMove"
      @touchend="onTouchEnd"
    >
      <!-- Swipe hint -->
      <div
        v-if="canSwipe && !isDone"
        class="flex items-center gap-1 mb-2"
      >
        <UIcon
          name="i-lucide-arrow-right"
          class="size-3"
          :class="canSwipeStart ? 'text-[#136dec]' : 'text-emerald-500'"
        />
        <span
          class="text-[10px] font-semibold uppercase tracking-wider"
          :class="canSwipeStart ? 'text-[#136dec]' : 'text-emerald-500'"
        >
          {{ canSwipeStart ? 'Desliza para iniciar' : 'Desliza para aceptar' }}
        </span>
      </div>

      <div class="flex items-start justify-between mb-2">
        <h3 class="text-[14px] font-bold text-[#0d131b]">
          {{ request.title }}
        </h3>
        <span
          class="text-[11px] font-bold px-2.5 py-1 rounded-full shrink-0"
          :class="statusColor(request.status)"
        >
          {{ statusLabel(request.status) }}
        </span>
      </div>

      <p class="text-[13px] text-[#64748b] leading-relaxed line-clamp-2 mb-3">
        {{ request.description }}
      </p>

      <div class="flex items-center gap-4">
        <div class="flex items-center gap-1 text-[12px] text-neutral-400">
          <UIcon
            name="i-lucide-map-pin"
            class="size-3.5"
          />
          <span class="line-clamp-1">{{ request.locationAddress }}</span>
        </div>
      </div>

      <div class="flex items-center justify-between mt-3 pt-3 border-t border-[#f3f4f6]">
        <div class="flex items-center gap-1 text-[12px] text-neutral-400">
          <UIcon
            name="i-lucide-calendar"
            class="size-3.5"
          />
          <span>{{ formatDate(request.scheduledAt) }}</span>
        </div>
        <span
          v-if="request.estimatedPrice"
          class="text-[14px] font-bold text-[#0d131b]"
        >
          {{ formatPrice(request.estimatedPrice) }}
        </span>
      </div>

      <!-- Complete button for IN_PROGRESS only -->
      <div
        v-if="request.status === RequestStatus.IN_PROGRESS"
        class="mt-3 pt-3 border-t border-[#f3f4f6]"
      >
        <button
          class="w-full h-10 bg-[#136dec] rounded-lg flex items-center justify-center gap-2 text-white text-[14px] font-bold transition active:scale-[0.98]"
          @click.stop="emit('complete', request.id)"
        >
          <UIcon
            name="i-lucide-check-circle"
            class="size-4"
          />
          Completar servicio
        </button>
      </div>
    </div>
  </div>
</template>
