<script setup lang="ts">
import type { IProviderCompleteData } from '~/interfaces/IProvider'
import type { IRequestsProvider } from '~/interfaces/IRequestProvider'
import type { IReviewsProvider } from '~/interfaces/IReviews'
import providersApi from '~/services/providersApi'
import requestsProviderApi from '~/services/requestsProviderApi'
import reviewsProviderApi from '~/services/reviewsProviderApi'

definePageMeta({ middleware: ['auth', 'role'] })

const { user } = useAuth()
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

// --- Helpers ---
function statusLabel(status: string) {
  const map: Record<string, string> = {
    pending: 'Pendiente',
    accepted: 'Aceptada',
    in_progress: 'En progreso',
    completed: 'Completada',
    cancelled: 'Cancelada'
  }
  return map[status] || status
}

function statusColor(status: string) {
  const map: Record<string, string> = {
    pending: 'bg-yellow-50 text-yellow-600',
    accepted: 'bg-blue-50 text-blue-600',
    in_progress: 'bg-purple-50 text-purple-600',
    completed: 'bg-emerald-50 text-emerald-600',
    cancelled: 'bg-red-50 text-red-600'
  }
  return map[status] || 'bg-gray-50 text-gray-600'
}

const sortedRequests = computed(() =>
  [...requests.value].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
)

watch(activeTab, (val) => {
  if (val === 'solicitudes') navigateTo('/provider-home?tab=solicitudes')
})

onMounted(async () => {
  await fetchProvider()
  fetchRequests()
  fetchReviews()
})
</script>

<template>
  <ClientOnly>
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
    </div>
  </ClientOnly>
</template>
