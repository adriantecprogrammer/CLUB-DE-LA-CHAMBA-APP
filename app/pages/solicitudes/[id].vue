<script setup lang="ts">
import type { IRequests } from '~/interfaces/IRequests'
import type { IProviderCompleteData } from '~/interfaces/IProvider'
import { RequestStatus, getStatusConfig } from '~/enums/requestStatus'
import requestClientApi from '~/services/requestClientApi'
import providersApi from '~/services/providersApi'
import requestsProviderApi from '~/services/requestsProviderApi'

definePageMeta({ middleware: ['auth'] })

const { user } = useAuth()
const route = useRoute()
const router = useRouter()
const toast = useToast()
const requestId = route.params.id as string

const isProvider = computed(() => user.value?.role?.toLowerCase().includes('provider'))

const provider = ref<IProviderCompleteData | null>(null)

async function fetchProvider() {
  if (!user.value || !isProvider.value) return
  try {
    provider.value = await providersApi.getProviderCompleteDataByUserId(user.value.id)
  } catch (err) {
    console.error('Error al cargar perfil de proveedor:', err)
  }
}

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

const canAccept = computed(() =>
  isProvider.value
  && request.value?.status === RequestStatus.PENDING
  && !!provider.value?.provider
)

const canStart = computed(() =>
  isProvider.value
  && request.value?.status === RequestStatus.ASSIGNED
)

const canComplete = computed(() =>
  isProvider.value
  && request.value?.status === RequestStatus.IN_PROGRESS
)

const canPay = computed(() =>
  !isProvider.value
  && request.value?.status === RequestStatus.COMPLETED
  && !!request.value?.finalPrice
  && request.value!.finalPrice! > 0
  && !!request.value?.providerId
)

function onAcceptError() {
  navigateTo('/provider-home')
}

function onStarted() {
  fetchRequest()
}

// --- Complete request ---
const showCompleteModal = ref(false)
const finalPriceInput = ref('')
const completing = ref(false)

function openCompleteModal() {
  finalPriceInput.value = ''
  showCompleteModal.value = true
}

function closeCompleteModal() {
  showCompleteModal.value = false
  finalPriceInput.value = ''
}

async function confirmComplete() {
  if (!finalPriceInput.value) return
  completing.value = true
  try {
    await requestsProviderApi.completeRequest(requestId, Number(finalPriceInput.value))
    toast.add({ title: 'Solicitud completada', description: 'El cliente podrá realizar el pago', color: 'success' })
    closeCompleteModal()
    await fetchRequest()
  } catch (err) {
    console.error('Error al completar solicitud:', err)
    toast.add({ title: 'Error', description: 'No se pudo completar la solicitud', color: 'error' })
  } finally {
    completing.value = false
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

function goToPayment() {
  if (!request.value?.providerId || !request.value?.finalPrice) return
  navigateTo(`/payment/checkout?requestId=${requestId}&providerId=${request.value.providerId}&amount=${request.value.finalPrice}`)
}

const needsBottomPadding = computed(() =>
  canPay.value || canComplete.value
)

onMounted(async () => {
  await fetchRequest()
  fetchProvider()
})
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
      class="flex flex-col gap-3 px-4 pt-2"
      :class="needsBottomPadding ? 'pb-[140px]' : 'pb-8'"
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

      <!-- Provider actions -->
      <!-- Accept swipe (PENDING) -->
      <AcceptRequestSwipe
        v-if="canAccept"
        :request-id="requestId"
        :provider-id="provider!.provider.id"
        @accepted="fetchRequest"
        @error="onAcceptError"
      />

      <!-- Start swipe (ASSIGNED) -->
      <StartRequestSwipe
        v-if="canStart"
        :request-id="requestId"
        @started="onStarted"
        @error="onStarted"
      />

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

    <!-- Fixed bottom: Pay button (client) or Complete button (provider) -->
    <div
      v-if="(canPay || canComplete) && request"
      class="fixed bottom-0 left-0 right-0 z-20 bg-white border-t border-[#f1f5f9] pt-[17px] pb-8 px-4 shadow-[0px_-4px_6px_-1px_rgba(0,0,0,0.05)]"
    >
      <!-- Client: Pay button -->
      <button
        v-if="canPay"
        class="w-full h-12 bg-[#136dec] rounded-xl flex items-center justify-center gap-2 shadow-[0px_10px_15px_-3px_rgba(19,109,236,0.3),0px_4px_6px_-4px_rgba(19,109,236,0.3)] transition active:scale-[0.98]"
        @click="goToPayment"
      >
        <UIcon
          name="i-lucide-credit-card"
          class="size-4 text-white"
        />
        <span class="text-[16px] font-bold text-white">
          Pagar ${{ request.finalPrice }}
        </span>
      </button>

      <!-- Provider: Complete button -->
      <button
        v-if="canComplete"
        class="w-full h-12 bg-[#136dec] rounded-xl flex items-center justify-center gap-2 shadow-[0px_10px_15px_-3px_rgba(19,109,236,0.3),0px_4px_6px_-4px_rgba(19,109,236,0.3)] transition active:scale-[0.98]"
        @click="openCompleteModal"
      >
        <UIcon
          name="i-lucide-check-circle"
          class="size-4 text-white"
        />
        <span class="text-[16px] font-bold text-white">
          Completar Servicio
        </span>
      </button>
    </div>

    <!-- Complete request modal -->
    <Teleport to="body">
      <div
        v-if="showCompleteModal"
        class="fixed inset-0 z-50 flex items-end justify-center"
      >
        <div
          class="absolute inset-0 bg-black/40"
          @click="closeCompleteModal"
        />
        <div class="relative w-full max-w-lg bg-white rounded-t-2xl p-6 pb-10">
          <div class="flex items-center justify-between mb-5">
            <h3 class="text-[18px] font-bold text-[#0f172a]">
              Completar Servicio
            </h3>
            <button
              class="size-8 rounded-full bg-[#f1f5f9] flex items-center justify-center"
              @click="closeCompleteModal"
            >
              <UIcon
                name="i-lucide-x"
                class="size-4 text-[#64748b]"
              />
            </button>
          </div>

          <p class="text-[14px] text-[#64748b] mb-4">
            Ingresa el precio final del servicio realizado.
          </p>

          <div class="relative mb-5">
            <span class="absolute left-4 top-1/2 -translate-y-1/2 text-[16px] font-bold text-[#64748b]">$</span>
            <input
              v-model="finalPriceInput"
              type="number"
              inputmode="numeric"
              min="1"
              placeholder="0.00"
              class="w-full h-14 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl pl-9 pr-4 text-[22px] font-bold text-[#0f172a] placeholder-[#94a3b8] focus:outline-none focus:ring-2 focus:ring-[#136dec]/20 focus:border-[#136dec]"
            >
          </div>

          <button
            class="w-full h-12 bg-[#136dec] rounded-xl flex items-center justify-center gap-2 text-[16px] font-bold text-white shadow-[0px_10px_15px_-3px_rgba(19,109,236,0.3)] transition active:scale-[0.98] disabled:opacity-40"
            :disabled="completing || !finalPriceInput || Number(finalPriceInput) <= 0"
            @click="confirmComplete"
          >
            <div
              v-if="completing"
              class="size-5 border-2 border-white border-t-transparent rounded-full animate-spin"
            />
            <template v-else>
              <UIcon
                name="i-lucide-check-circle"
                class="size-4"
              />
              Completar Solicitud
            </template>
          </button>
        </div>
      </div>
    </Teleport>
  </div>
</template>
