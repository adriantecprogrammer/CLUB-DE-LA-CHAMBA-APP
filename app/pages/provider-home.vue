<script setup lang="ts">
import type { IProviderCompleteData } from '~/interfaces/IProvider'
import type { IRequestsProvider } from '~/interfaces/IRequestProvider'
import type { IReviewsProvider } from '~/interfaces/IReviews'
import { RequestStatus, getStatusConfig } from '~/enums/requestStatus'
import providersApi from '~/services/providersApi'
import requestsProviderApi from '~/services/requestsProviderApi'
import reviewsProviderApi from '~/services/reviewsProviderApi'

definePageMeta({ middleware: ['auth', 'role'] })

const { user } = useAuth()
const toast = useToast()
const activeTab = ref('inicio')

// --- Provider profile ---
const provider = ref<IProviderCompleteData | null>(null)
const profileLoading = ref(true)

async function fetchProvider() {
  if (!user.value) return
  profileLoading.value = true
  try {
    provider.value = await providersApi.getProviderCompleteDataByUserId(user.value.id)
  } catch (err) {
    console.error('Error al cargar perfil de proveedor:', err)
  } finally {
    profileLoading.value = false
  }
}

// --- Requests ---
const requests = ref<IRequestsProvider[]>([])
const requestsLoading = ref(false)

async function fetchRequests() {
  if (!provider.value?.provider) return
  requestsLoading.value = true
  try {
    requests.value = await requestsProviderApi.getRequestsProvidersByUser(provider.value.provider.id)
  } catch (err) {
    console.error('Error al cargar solicitudes:', err)
  } finally {
    requestsLoading.value = false
  }
}

// --- Reviews (for inicio tab) ---
const reviews = ref<IReviewsProvider[]>([])
const reviewsLoading = ref(false)

async function fetchReviews() {
  if (!provider.value?.provider) return
  reviewsLoading.value = true
  try {
    reviews.value = await reviewsProviderApi.getReviewsProviderByUser(provider.value.provider.id)
  } catch (err) {
    console.error('Error al cargar reseñas:', err)
  } finally {
    reviewsLoading.value = false
  }
}

// --- Accept request ---
const acceptingId = ref<string | null>(null)

async function acceptRequest(requestId: string) {
  if (!provider.value?.provider || acceptingId.value) return
  acceptingId.value = requestId
  try {
    await requestsProviderApi.acceptRequest(provider.value.provider.id, requestId)
    await fetchRequests()
  } catch (err) {
    console.error('Error al aceptar solicitud:', err)
    await fetchRequests()
  } finally {
    acceptingId.value = null
  }
}

// --- Start request ---
const startingId = ref<string | null>(null)

async function startRequest(requestId: string) {
  if (startingId.value) return
  startingId.value = requestId
  try {
    await requestsProviderApi.startRequest(requestId)
    toast.add({ title: 'Servicio iniciado', description: 'El cliente será notificado', color: 'success' })
    await fetchRequests()
  } catch (err) {
    console.error('Error al iniciar solicitud:', err)
    toast.add({ title: 'Error', description: 'No se pudo iniciar la solicitud', color: 'error' })
    await fetchRequests()
  } finally {
    startingId.value = null
  }
}

// --- Complete request ---
const completingId = ref<string | null>(null)
const finalPriceInput = ref('')
const completing = ref(false)

function startCompleteFlow(requestId: string) {
  completingId.value = requestId
  finalPriceInput.value = ''
}

function cancelComplete() {
  completingId.value = null
  finalPriceInput.value = ''
}

async function confirmComplete() {
  if (!completingId.value || !finalPriceInput.value) return
  completing.value = true
  try {
    await requestsProviderApi.completeRequest(completingId.value, Number(finalPriceInput.value))
    toast.add({ title: 'Solicitud completada', description: 'El cliente podrá realizar el pago', color: 'success' })
    cancelComplete()
    await fetchRequests()
  } catch (err) {
    console.error('Error al completar solicitud:', err)
    toast.add({ title: 'Error', description: 'No se pudo completar la solicitud', color: 'error' })
  } finally {
    completing.value = false
  }
}

function viewRequestDetail(requestId: string) {
  navigateTo(`/solicitudes/${requestId}`)
}

// --- Helpers ---
function statusLabel(status: string) {
  return getStatusConfig(status).label
}

function statusColor(status: string) {
  const config = getStatusConfig(status)
  return `${config.badgeBg} ${config.badgeColor}`
}

const sortedRequests = computed(() =>
  [...requests.value].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
)

const solicitudesFilter = ref('all')

const filteredRequests = computed(() => {
  if (solicitudesFilter.value === 'all') return sortedRequests.value
  return sortedRequests.value.filter(r => r.status === solicitudesFilter.value)
})

watch(activeTab, (val) => {
  if (val === 'solicitudes') fetchRequests()
})

onMounted(async () => {
  await fetchProvider()
  fetchRequests()
  fetchReviews()
})
</script>

<template>
  <div
    v-if="user"
    class="bg-white min-h-screen font-[Manrope,sans-serif]"
  >
    <!-- ═══════════════════════════════════════════ -->
    <!--                TAB: INICIO                -->
    <!-- ═══════════════════════════════════════════ -->
    <template v-if="activeTab === 'inicio'">
      <header class="sticky top-0 z-20 backdrop-blur-sm bg-[rgba(248,249,252,0.95)] border-b border-[#f3f4f6] flex items-center justify-between px-5 py-4">
        <div class="flex items-center gap-3">
          <div class="size-10 rounded-full bg-primary-600 flex items-center justify-center shrink-0">
            <span class="text-white font-bold text-sm uppercase">
              {{ user?.firstName?.charAt(0) }}{{ user?.lastName?.charAt(0) }}
            </span>
          </div>
          <div>
            <p class="text-[10px] font-semibold tracking-widest uppercase text-neutral-400">
              Modo proveedor
            </p>
            <h2 class="text-[18px] font-bold text-[#0d131b]">
              {{ user?.firstName }} {{ user?.lastName }}
            </h2>
          </div>
        </div>
        <button
          class="size-10 rounded-full bg-white border border-neutral-200 shadow-sm flex items-center justify-center relative"
        >
          <UIcon
            name="i-lucide-bell"
            class="size-5 text-neutral-600"
          />
        </button>
      </header>

      <main class="bg-[#f8f9fc] pb-[100px]">
        <!-- Profile Card -->
        <section class="px-5 pt-5">
          <div
            v-if="profileLoading"
            class="bg-white rounded-2xl border border-[#f3f4f6] shadow-[0px_2px_8px_0px_rgba(0,0,0,0.04)] p-5 animate-pulse"
          >
            <div class="h-5 w-24 rounded bg-neutral-100 mb-4" />
            <div class="h-3 w-full rounded bg-neutral-100 mb-2" />
            <div class="h-3 w-3/4 rounded bg-neutral-100" />
          </div>

          <div
            v-else-if="provider"
            class="bg-white rounded-2xl border border-[#f3f4f6] shadow-[0px_2px_8px_0px_rgba(0,0,0,0.04)] p-5"
          >
            <div class="flex items-start justify-between mb-3">
              <h3 class="text-[16px] font-bold text-[#0d131b]">
                Mi perfil profesional
              </h3>
              <button
                class="flex items-center gap-1 bg-[rgba(19,109,236,0.1)] px-3 py-1.5 rounded-full transition active:scale-95"
                @click="activeTab = 'perfil'"
              >
                <UIcon
                  name="i-lucide-eye"
                  class="size-3 text-primary-600"
                />
                <span class="text-[12px] font-bold text-primary-600">Ver perfil</span>
              </button>
            </div>

            <p
              v-if="provider.provider?.bio"
              class="text-[14px] text-[#64748b] leading-relaxed mb-4"
            >
              {{ provider.provider.bio }}
            </p>

            <div class="grid grid-cols-2 gap-3">
              <div class="bg-[#f8f9fc] rounded-xl p-3 flex items-center gap-3">
                <div class="size-9 rounded-full bg-yellow-50 flex items-center justify-center shrink-0">
                  <UIcon
                    name="i-lucide-star"
                    class="size-4 text-yellow-500"
                  />
                </div>
                <div>
                  <p class="text-[18px] font-bold text-[#0d131b]">
                    {{ provider.provider?.ratingAvg?.toFixed(1) ?? '0.0' }}
                  </p>
                  <p class="text-[10px] text-neutral-400 font-medium">
                    {{ provider.provider?.ratingCount ?? 0 }} reseñas
                  </p>
                </div>
              </div>

              <div class="bg-[#f8f9fc] rounded-xl p-3 flex items-center gap-3">
                <div class="size-9 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                  <UIcon
                    name="i-lucide-briefcase"
                    class="size-4 text-blue-500"
                  />
                </div>
                <div>
                  <p class="text-[18px] font-bold text-[#0d131b]">
                    {{ provider.provider?.completedJobs ?? 0 }}
                  </p>
                  <p class="text-[10px] text-neutral-400 font-medium">
                    Trabajos completados
                  </p>
                </div>
              </div>

              <div class="bg-[#f8f9fc] rounded-xl p-3 flex items-center gap-3">
                <div class="size-9 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
                  <UIcon
                    name="i-lucide-clock"
                    class="size-4 text-emerald-500"
                  />
                </div>
                <div>
                  <p class="text-[18px] font-bold text-[#0d131b]">
                    {{ provider.provider?.experienceYears ?? 0 }}+
                  </p>
                  <p class="text-[10px] text-neutral-400 font-medium">
                    Años de experiencia
                  </p>
                </div>
              </div>

              <div
                class="bg-[#f8f9fc] rounded-xl p-3 flex items-center gap-3"
              >
                <div
                  class="size-9 rounded-full flex items-center justify-center shrink-0"
                  :class="provider.provider?.verified ? 'bg-emerald-50' : 'bg-neutral-100'"
                >
                  <UIcon
                    name="i-lucide-shield-check"
                    class="size-4"
                    :class="provider.provider?.verified ? 'text-emerald-500' : 'text-neutral-400'"
                  />
                </div>
                <div>
                  <p class="text-[18px] font-bold text-[#0d131b]">
                    {{ provider.provider?.verified ? 'Sí' : 'No' }}
                  </p>
                  <p class="text-[10px] text-neutral-400 font-medium">
                    Verificado
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Solicitudes recientes -->
        <section class="pt-6 px-5">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-[20px] font-bold text-[#0d131b]">
              Solicitudes recientes
            </h2>
            <span class="text-[14px] font-semibold text-primary-600">
              {{ requests.length }} total
            </span>
          </div>

          <div
            v-if="requestsLoading"
            class="flex flex-col gap-3"
          >
            <div
              v-for="n in 3"
              :key="n"
              class="bg-white border border-[#f3f4f6] rounded-xl p-4 animate-pulse"
            >
              <div class="flex justify-between mb-3">
                <div class="h-4 w-32 rounded bg-neutral-100" />
                <div class="h-5 w-16 rounded-full bg-neutral-100" />
              </div>
              <div class="h-3 w-full rounded bg-neutral-100 mb-2" />
              <div class="h-3 w-2/3 rounded bg-neutral-100" />
            </div>
          </div>

          <div
            v-else-if="sortedRequests.length === 0"
            class="bg-white border border-[#f3f4f6] rounded-xl p-6 flex flex-col items-center gap-2"
          >
            <div class="size-12 rounded-full bg-neutral-100 flex items-center justify-center">
              <UIcon
                name="i-lucide-inbox"
                class="size-6 text-neutral-400"
              />
            </div>
            <p class="text-[14px] text-neutral-400 font-medium">
              Aún no tienes solicitudes
            </p>
          </div>

          <div
            v-else
            class="flex flex-col gap-3"
          >
            <div
              v-for="req in sortedRequests.slice(0, 5)"
              :key="req.id"
              class="bg-white border border-[#f3f4f6] rounded-xl p-4 transition active:scale-[0.98]"
            >
              <div class="flex items-start justify-between mb-2">
                <h3 class="text-[14px] font-bold text-[#0d131b]">
                  {{ req.title }}
                </h3>
                <span
                  class="text-[11px] font-bold px-2.5 py-1 rounded-full shrink-0"
                  :class="statusColor(req.status)"
                >
                  {{ statusLabel(req.status) }}
                </span>
              </div>
              <p class="text-[13px] text-[#64748b] leading-relaxed line-clamp-2 mb-3">
                {{ req.description }}
              </p>
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-1 text-[12px] text-neutral-400">
                  <UIcon
                    name="i-lucide-calendar"
                    class="size-3.5"
                  />
                  <span>{{ formatDate(req.scheduledAt) }}</span>
                </div>
                <span
                  v-if="req.estimatedPrice"
                  class="text-[14px] font-bold text-[#0d131b]"
                >
                  {{ formatPrice(req.estimatedPrice) }}
                </span>
              </div>
            </div>
          </div>
        </section>

        <!-- Reseñas -->
        <section class="pt-6 px-5 pb-6">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-[20px] font-bold text-[#0d131b]">
              Reseñas de clientes
            </h2>
            <span class="text-[14px] font-semibold text-primary-600">
              {{ reviews.length }} total
            </span>
          </div>

          <div
            v-if="reviewsLoading"
            class="flex flex-col gap-3"
          >
            <div
              v-for="n in 2"
              :key="n"
              class="bg-white border border-[#f3f4f6] rounded-xl p-4 animate-pulse"
            >
              <div class="h-4 w-24 rounded bg-neutral-100 mb-2" />
              <div class="h-3 w-full rounded bg-neutral-100 mb-2" />
              <div class="h-3 w-3/4 rounded bg-neutral-100" />
            </div>
          </div>

          <div
            v-else-if="reviews.length === 0"
            class="bg-white border border-[#f3f4f6] rounded-xl p-6 flex flex-col items-center gap-2"
          >
            <div class="size-12 rounded-full bg-neutral-100 flex items-center justify-center">
              <UIcon
                name="i-lucide-message-square"
                class="size-6 text-neutral-400"
              />
            </div>
            <p class="text-[14px] text-neutral-400 font-medium">
              Aún no tienes reseñas
            </p>
          </div>

          <div
            v-else
            class="flex flex-col gap-3"
          >
            <div
              v-for="review in reviews.slice(0, 5)"
              :key="review.id"
              class="bg-white border border-[#f3f4f6] rounded-xl p-4"
            >
              <div class="flex items-center gap-1 mb-2">
                <UIcon
                  v-for="star in 5"
                  :key="star"
                  name="i-lucide-star"
                  class="size-4"
                  :class="star <= review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-neutral-200'"
                />
              </div>
              <p class="text-[13px] text-[#64748b] leading-relaxed mb-2">
                {{ review.comment }}
              </p>
              <p class="text-[11px] text-neutral-400">
                {{ formatDate(review.createdAt) }}
              </p>
            </div>
          </div>
        </section>
      </main>

      <HomeBottomNav v-model="activeTab" />
    </template>

    <!-- ═══════════════════════════════════════════ -->
    <!--            TAB: SOLICITUDES               -->
    <!-- ═══════════════════════════════════════════ -->
    <template v-else-if="activeTab === 'solicitudes'">
      <header class="sticky top-0 z-20 backdrop-blur-sm bg-[rgba(248,249,252,0.95)] border-b border-[#f3f4f6] px-5 py-4">
        <h2 class="text-[20px] font-bold text-[#0d131b]">
          Mis Solicitudes
        </h2>
        <p class="text-[13px] text-neutral-400 mt-0.5">
          {{ requests.length }} solicitudes en total
        </p>
      </header>

      <main class="bg-[#f8f9fc] pb-[100px] min-h-screen">
        <!-- Filtros -->
        <section class="px-5 pt-4">
          <div class="flex gap-2 overflow-x-auto no-scrollbar">
            <button
              v-for="f in [
                { key: 'all', label: 'Todas' },
                { key: RequestStatus.PENDING, label: 'Pendientes' },
                { key: RequestStatus.ASSIGNED, label: 'Asignadas' },
                { key: RequestStatus.IN_PROGRESS, label: 'En progreso' },
                { key: RequestStatus.COMPLETED, label: 'Completadas' },
                { key: RequestStatus.PAID, label: 'Pagadas' }
              ]"
              :key="f.key"
              class="px-4 py-2 rounded-full text-[12px] font-semibold whitespace-nowrap transition shrink-0"
              :class="solicitudesFilter === f.key
                ? 'bg-primary-600 text-white'
                : 'bg-white text-neutral-500 border border-[#f3f4f6]'"
              @click="solicitudesFilter = f.key"
            >
              {{ f.label }}
            </button>
          </div>
        </section>

        <!-- Lista -->
        <section class="px-5 pt-4">
          <div
            v-if="requestsLoading"
            class="flex flex-col gap-3"
          >
            <div
              v-for="n in 4"
              :key="n"
              class="bg-white border border-[#f3f4f6] rounded-xl p-4 animate-pulse"
            >
              <div class="flex justify-between mb-3">
                <div class="h-4 w-32 rounded bg-neutral-100" />
                <div class="h-5 w-16 rounded-full bg-neutral-100" />
              </div>
              <div class="h-3 w-full rounded bg-neutral-100 mb-2" />
              <div class="h-3 w-2/3 rounded bg-neutral-100" />
            </div>
          </div>

          <div
            v-else-if="filteredRequests.length === 0"
            class="bg-white border border-[#f3f4f6] rounded-xl p-8 flex flex-col items-center gap-3"
          >
            <div class="size-14 rounded-full bg-neutral-100 flex items-center justify-center">
              <UIcon
                name="i-lucide-inbox"
                class="size-7 text-neutral-400"
              />
            </div>
            <p class="text-[14px] text-neutral-400 font-medium">
              {{ solicitudesFilter === 'all' ? 'Aún no tienes solicitudes' : 'No hay solicitudes con este estado' }}
            </p>
          </div>

          <div
            v-else
            class="flex flex-col gap-3"
          >
            <SwipeableRequestCard
              v-for="req in filteredRequests"
              :key="req.id"
              :request="req"
              @accept="acceptRequest"
              @view="viewRequestDetail"
              @start="startRequest"
              @complete="startCompleteFlow"
            />
          </div>
        </section>
      </main>

      <HomeBottomNav v-model="activeTab" />
    </template>

    <!-- ═══════════════════════════════════════════ -->
    <!--                TAB: PERFIL                -->
    <!-- ═══════════════════════════════════════════ -->
    <template v-else-if="activeTab === 'perfil'">
      <ProviderProfileView
        v-if="provider?.provider"
        mode="own"
        :provider-id="provider.id"
        @back="activeTab = 'inicio'"
      />
    </template>

    <!-- Complete request modal -->
    <Teleport to="body">
      <div
        v-if="completingId"
        class="fixed inset-0 z-50 flex items-end justify-center"
      >
        <div
          class="absolute inset-0 bg-black/40"
          @click="cancelComplete"
        />
        <div class="relative w-full max-w-lg bg-white rounded-t-2xl p-6 pb-10">
          <div class="flex items-center justify-between mb-5">
            <h3 class="text-[18px] font-bold text-[#0f172a]">
              Completar Servicio
            </h3>
            <button
              class="size-8 rounded-full bg-[#f1f5f9] flex items-center justify-center"
              @click="cancelComplete"
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
