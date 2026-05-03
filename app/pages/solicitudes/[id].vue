<script setup lang="ts">
import type { IRequests } from '~/interfaces/IRequests'
import { getStatusConfig } from '~/enums/requestStatus'
import requestClientApi from '~/services/requestClientApi'

definePageMeta({ middleware: ['auth'] })

const route = useRoute()
const router = useRouter()
const requestId = route.params.id as string

const request = ref<IRequests | null>(null)
const loading = ref(true)

async function fetchRequest() {
  loading.value = true
  try {
    request.value = await requestClientApi.getRequestById(requestId)
  } catch (err) {
    console.error('Error al cargar solicitud:', err)
  } finally {
    loading.value = false
  }
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('es-MX', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function formatId(id: string) {
  return `#SR-${id.slice(-4).toUpperCase()}`
}

function handleBack() {
  if (window.history.length > 1) {
    router.back()
  } else {
    navigateTo('/solicitudes')
  }
}

onMounted(fetchRequest)
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
        Detalle de Solicitud
      </h1>
      <div class="size-10" />
    </header>

    <!-- Loading -->
    <div
      v-if="loading"
      class="p-5 flex flex-col gap-4 animate-pulse"
    >
      <div class="h-32 rounded-xl bg-white" />
      <div class="h-48 rounded-xl bg-white" />
      <div class="h-40 rounded-xl bg-white" />
    </div>

    <!-- Content -->
    <div
      v-else-if="request"
      class="flex flex-col gap-3 px-4 pt-2 pb-8"
    >
      <!-- Status + Title card -->
      <div class="bg-white border border-[#f1f5f9] rounded-xl p-[17px] flex flex-col gap-3 shadow-[0px_1px_1px_rgba(0,0,0,0.05)]">
        <div class="flex items-start justify-between gap-2">
          <div class="flex flex-col gap-1">
            <p class="text-[20px] font-bold text-[#0f172a] leading-7">
              {{ request.title }}
            </p>
            <p class="text-[14px] text-[#64748b]">
              ID: {{ formatId(request.id) }}
            </p>
          </div>
          <span
            class="text-[12px] font-semibold px-[10px] py-1 rounded-full shrink-0"
            :class="[getStatusConfig(request.status).badgeBg, getStatusConfig(request.status).badgeColor]"
          >
            {{ getStatusConfig(request.status).label }}
          </span>
        </div>
        <div class="flex items-center gap-2 text-[14px] text-[#475569]">
          <UIcon
            name="i-lucide-calendar"
            class="size-4 shrink-0"
          />
          <span>Solicitado el {{ formatDate(request.createdAt) }}</span>
        </div>
      </div>

      <!-- Description -->
      <div class="bg-white border border-[#f1f5f9] rounded-xl p-[17px] flex flex-col gap-2 shadow-[0px_1px_1px_rgba(0,0,0,0.05)]">
        <h3 class="text-[16px] font-bold text-[#0f172a]">
          Descripción
        </h3>
        <p class="text-[14px] text-[#475569] leading-[22px]">
          {{ request.description || 'Sin descripción' }}
        </p>
      </div>

      <!-- Location -->
      <div class="bg-white border border-[#f1f5f9] rounded-xl overflow-hidden shadow-[0px_1px_1px_rgba(0,0,0,0.05)]">
        <div class="p-[17px] pb-3">
          <h3 class="text-[16px] font-bold text-[#0f172a]">
            Ubicación
          </h3>
        </div>
        <div class="h-40 bg-[#e2e8f0] relative overflow-hidden">
          <iframe
            v-if="request.locationLat && request.locationLng"
            :src="`https://www.openstreetmap.org/export/embed.html?bbox=${request.locationLng - 0.005},${request.locationLat - 0.005},${request.locationLng + 0.005},${request.locationLat + 0.005}&layer=mapnik&marker=${request.locationLat},${request.locationLng}`"
            class="size-full border-0"
            loading="lazy"
          />
          <div
            v-else
            class="size-full flex items-center justify-center"
          >
            <UIcon
              name="i-lucide-map-pin"
              class="size-8 text-[#94a3b8]"
            />
          </div>
        </div>
        <div class="flex items-center gap-3 p-4">
          <UIcon
            name="i-lucide-map-pin"
            class="size-5 text-[#136dec] shrink-0"
          />
          <span class="text-[14px] text-[#475569]">
            {{ request.locationAddress || 'Sin dirección' }}
          </span>
        </div>
      </div>

      <!-- Details grid -->
      <div class="grid grid-cols-2 gap-3">
        <div class="bg-white border border-[#f1f5f9] rounded-xl p-4 flex flex-col gap-1 shadow-[0px_1px_1px_rgba(0,0,0,0.05)]">
          <p class="text-[12px] font-medium text-[#64748b] uppercase tracking-[0.5px]">
            Precio Estimado
          </p>
          <p class="text-[18px] font-bold text-[#0f172a]">
            ${{ request.estimatedPrice }}
          </p>
        </div>
        <div class="bg-white border border-[#f1f5f9] rounded-xl p-4 flex flex-col gap-1 shadow-[0px_1px_1px_rgba(0,0,0,0.05)]">
          <p class="text-[12px] font-medium text-[#64748b] uppercase tracking-[0.5px]">
            Precio Final
          </p>
          <p class="text-[18px] font-bold text-[#0f172a]">
            {{ request.finalPrice ? `$${request.finalPrice}` : 'Pendiente' }}
          </p>
        </div>
        <div class="bg-white border border-[#f1f5f9] rounded-xl p-4 flex flex-col gap-1 shadow-[0px_1px_1px_rgba(0,0,0,0.05)]">
          <p class="text-[12px] font-medium text-[#64748b] uppercase tracking-[0.5px]">
            Programado
          </p>
          <p class="text-[14px] font-bold text-[#0f172a]">
            {{ request.scheduledAt ? formatDate(request.scheduledAt) : 'Sin asignar' }}
          </p>
        </div>
        <div class="bg-white border border-[#f1f5f9] rounded-xl p-4 flex flex-col gap-1 shadow-[0px_1px_1px_rgba(0,0,0,0.05)]">
          <p class="text-[12px] font-medium text-[#64748b] uppercase tracking-[0.5px]">
            Actualizado
          </p>
          <p class="text-[14px] font-bold text-[#0f172a]">
            {{ formatDate(request.updatedAt) }}
          </p>
        </div>
      </div>
    </div>

    <!-- Not found -->
    <div
      v-else
      class="flex flex-col items-center justify-center gap-4 pt-24"
    >
      <UIcon
        name="i-lucide-alert-circle"
        class="size-12 text-[#94a3b8]"
      />
      <p class="text-[16px] font-semibold text-[#64748b]">
        No se encontró la solicitud
      </p>
    </div>
  </div>
</template>
