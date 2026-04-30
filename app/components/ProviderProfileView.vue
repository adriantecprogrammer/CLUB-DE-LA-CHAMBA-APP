<script setup lang="ts">
import type { IProviderCompleteData } from '~/interfaces/IProvider'
import type { IReviewsProvider } from '~/interfaces/IReviews'
import providersApi from '~/services/providersApi'
import reviewsProviderApi from '~/services/reviewsProviderApi'

const props = defineProps<{
  mode: 'own' | 'client'
  providerId: string
}>()

const emit = defineEmits<{
  back: []
}>()

const { clearSession } = useAuth()

const provider = ref<IProviderCompleteData | null>(null)
const reviews = ref<IReviewsProvider[]>([])
const loading = ref(true)
const reviewsLoading = ref(false)
const bioExpanded = ref(false)
const bioLimit = 120

async function fetchProfile() {
  loading.value = true
  try {
    provider.value = await providersApi.getProviderCompleteDataByUserId(props.providerId)
  } catch (err) {
    console.error('Error al cargar perfil:', err)
  } finally {
    loading.value = false
  }
}

async function fetchReviews() {
  reviewsLoading.value = true
  try {
    reviews.value = await reviewsProviderApi.getReviewsProviderByUser(props.providerId)
  } catch (err) {
    console.error('Error al cargar reseñas:', err)
  } finally {
    reviewsLoading.value = false
  }
}

const logout = async () => {
  clearSession()
  await navigateTo('/')
}

const displayBio = computed(() => {
  const bio = provider.value?.provider?.bio || ''
  if (bio.length <= bioLimit || bioExpanded.value) return bio
  return bio.slice(0, bioLimit) + '...'
})

const showReadMore = computed(() => {
  return (provider.value?.provider?.bio?.length ?? 0) > bioLimit
})

const reviewBreakdown = computed(() => {
  const total = reviews.value.length || 1
  const counts: number[] = [0, 0, 0, 0, 0]
  reviews.value.forEach((r) => {
    const idx = Math.min(Math.max(r.rating - 1, 0), 4)
    counts[idx] = (counts[idx] ?? 0) + 1
  })
  return [5, 4, 3, 2, 1].map(star => ({
    star,
    count: counts[star - 1] ?? 0,
    pct: Math.round(((counts[star - 1] ?? 0) / total) * 100)
  }))
})

onMounted(() => {
  fetchProfile()
  fetchReviews()
})
</script>

<template>
  <div class="min-h-screen font-[Manrope,sans-serif]">
    <!-- ── Header ── -->
    <header class="sticky top-0 z-20 backdrop-blur-[6px] bg-white/90 border-b border-[#f1f5f9] flex items-center justify-between px-4 pt-4 pb-[9px]">
      <button
        class="size-10 rounded-full flex items-center justify-center"
        @click="emit('back')"
      >
        <UIcon
          name="i-lucide-arrow-left"
          class="size-4 text-[#0f172a]"
        />
      </button>
      <h1 class="text-[18px] font-bold text-[#0f172a] tracking-[-0.45px]">
        Perfil
      </h1>
      <div class="size-10" />
    </header>

    <!-- ── Loading ── -->
    <div
      v-if="loading"
      class="flex flex-col gap-6 p-5 animate-pulse"
    >
      <div class="flex flex-col items-center gap-4">
        <div class="size-32 rounded-full bg-neutral-100" />
        <div class="h-6 w-32 rounded bg-neutral-100" />
        <div class="h-4 w-48 rounded bg-neutral-100" />
      </div>
      <div class="grid grid-cols-3 gap-3">
        <div
          v-for="n in 3"
          :key="n"
          class="h-24 rounded-2xl bg-neutral-100"
        />
      </div>
    </div>

    <!-- ── Content ── -->
    <main
      v-else-if="provider"
      :class="mode === 'client' ? 'pb-[110px]' : 'pb-0'"
    >
      <!-- ── Avatar + Name ── -->
      <section class="flex flex-col items-center pt-6 px-4">
        <div class="relative mb-2">
          <div class="size-32 rounded-full bg-[#f1f5f9] border-4 border-white shadow-lg flex items-center justify-center overflow-hidden">
            <span class="text-white font-extrabold text-4xl uppercase bg-primary-600 size-full flex items-center justify-center">
              {{ provider.firstName?.charAt(0) }}{{ provider.lastName?.charAt(0) }}
            </span>
          </div>
          <button
            v-if="mode === 'own'"
            class="absolute bottom-1 right-1 bg-primary-600 border-2 border-white rounded-full p-1.5 shadow-lg flex items-center justify-center"
          >
            <UIcon
              name="i-lucide-camera"
              class="size-3.5 text-white"
            />
          </button>
        </div>

        <h2 class="text-[24px] font-bold text-[#0f172a]">
          {{ provider.firstName }} {{ provider.lastName }}
        </h2>
        <p class="text-[16px] font-medium text-[#64748b]">
          {{ provider.provider?.bio ? provider.provider.bio.split('.')[0] : '' }}
        </p>

        <div class="flex items-center gap-1.5 pt-1">
          <span
            v-if="provider.provider?.verified"
            class="bg-[rgba(19,109,236,0.1)] text-[12px] font-bold text-primary-600 uppercase tracking-[0.3px] px-2 py-0.5 rounded-full"
          >
            Verificado
          </span>
          <div class="flex items-center gap-1">
            <UIcon
              name="i-lucide-star"
              class="size-3.5 text-yellow-400 fill-yellow-400"
            />
            <span class="text-[14px] font-bold text-[#0f172a]">
              {{ provider.provider?.ratingAvg?.toFixed(1) ?? '0.0' }}
            </span>
            <span class="text-[14px] text-[#94a3b8]">
              ({{ provider.provider?.ratingCount ?? 0 }} reseñas)
            </span>
          </div>
        </div>
      </section>

      <!-- ── Stats Cards ── -->
      <section class="flex gap-3 px-4 pt-4">
        <div class="flex-1 bg-surface-muted border border-[#f1f5f9] rounded-2xl flex flex-col items-center justify-center p-3 gap-1">
          <UIcon
            name="i-lucide-clock"
            class="size-5 text-[#0f172a] mb-1"
          />
          <p class="text-[18px] font-bold text-[#0f172a]">
            {{ provider.provider?.experienceYears ?? 0 }} Años
          </p>
          <p class="text-[12px] text-[#64748b]">
            Experiencia
          </p>
        </div>
        <div class="flex-1 bg-surface-muted border border-[#f1f5f9] rounded-2xl flex flex-col items-center justify-center p-3 gap-1">
          <UIcon
            name="i-lucide-briefcase"
            class="size-5 text-[#0f172a] mb-1"
          />
          <p class="text-[18px] font-bold text-[#0f172a]">
            {{ provider.provider?.completedJobs ?? 0 }}+
          </p>
          <p class="text-[12px] text-[#64748b]">
            Trabajos
          </p>
        </div>
        <div class="flex-1 bg-surface-muted border border-[#f1f5f9] rounded-2xl flex flex-col items-center justify-center p-3 gap-1">
          <UIcon
            name="i-lucide-zap"
            class="size-5 text-[#0f172a] mb-1"
          />
          <p class="text-[18px] font-bold text-[#0f172a]">
            &lt; 1 hr
          </p>
          <p class="text-[12px] text-[#64748b]">
            Respuesta
          </p>
        </div>
      </section>

      <!-- ── Sobre mí ── -->
      <section
        v-if="provider.provider?.bio"
        class="px-5 pt-4 pb-2 flex flex-col gap-2"
      >
        <h3 class="text-[18px] font-bold text-[#0f172a]">
          Sobre mí
        </h3>
        <p class="text-[14px] text-[#475569] leading-[22.75px]">
          {{ displayBio }}
        </p>
        <button
          v-if="showReadMore"
          class="text-[14px] font-semibold text-primary-600 text-left -mt-1"
          @click="bioExpanded = !bioExpanded"
        >
          {{ bioExpanded ? 'Ver menos' : 'Leer más' }}
        </button>
      </section>

      <!-- ── Reseñas ── -->
      <section class="px-5 pt-4 flex flex-col gap-4">
        <div class="flex items-center justify-between">
          <h3 class="text-[18px] font-bold text-[#0f172a]">
            Reseñas
          </h3>
          <button class="text-[14px] font-semibold text-primary-600">
            Ver todas
          </button>
        </div>

        <!-- Rating summary -->
        <div
          v-if="reviews.length > 0"
          class="bg-surface-muted rounded-xl p-4 flex items-center gap-6"
        >
          <div class="flex flex-col items-center min-w-[80px]">
            <span class="text-[36px] font-extrabold text-[#0f172a] leading-[40px]">
              {{ provider.provider?.ratingAvg?.toFixed(1) ?? '0.0' }}
            </span>
            <div class="flex items-center gap-0.5 pt-1">
              <UIcon
                v-for="star in 5"
                :key="star"
                name="i-lucide-star"
                class="size-[13px]"
                :class="star <= Math.round(provider.provider?.ratingAvg ?? 0) ? 'text-yellow-400 fill-yellow-400' : 'text-neutral-300'"
              />
            </div>
            <span class="text-[12px] text-[#64748b] pt-1">
              {{ reviews.length }} valoraciones
            </span>
          </div>

          <div class="flex-1 flex flex-col gap-1.5">
            <div
              v-for="row in reviewBreakdown"
              :key="row.star"
              class="flex items-center gap-2"
            >
              <span class="text-[12px] font-medium text-[#475569] w-3 text-right">
                {{ row.star }}
              </span>
              <div class="flex-1 h-1.5 bg-[#e2e8f0] rounded-full overflow-hidden">
                <div
                  class="h-full bg-primary-600 rounded-full transition-all duration-500"
                  :style="{ width: `${row.pct}%` }"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Individual reviews -->
        <div
          v-if="reviewsLoading"
          class="flex flex-col gap-4"
        >
          <div
            v-for="n in 2"
            :key="n"
            class="border-b border-[#f1f5f9] pb-4 animate-pulse"
          >
            <div class="flex items-center gap-3 mb-3">
              <div class="size-10 rounded-full bg-neutral-100" />
              <div class="h-4 w-24 rounded bg-neutral-100" />
            </div>
            <div class="h-3 w-full rounded bg-neutral-100 mb-2" />
            <div class="h-3 w-3/4 rounded bg-neutral-100" />
          </div>
        </div>

        <div
          v-else-if="reviews.length === 0"
          class="bg-surface-muted rounded-xl p-6 flex flex-col items-center gap-2"
        >
          <UIcon
            name="i-lucide-message-square"
            class="size-6 text-neutral-400"
          />
          <p class="text-[14px] text-neutral-400 font-medium">
            Aún no hay reseñas
          </p>
        </div>

        <div
          v-else
          class="flex flex-col gap-0"
        >
          <div
            v-for="(review, idx) in reviews.slice(0, 4)"
            :key="review.id"
            class="flex flex-col gap-3"
            :class="idx < reviews.slice(0, 4).length - 1 ? 'border-b border-[#f1f5f9] pb-4 mb-4' : 'pb-6'"
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="size-10 rounded-full bg-primary-100 flex items-center justify-center shrink-0">
                  <span class="text-[14px] font-bold text-primary-600">
                    {{ String.fromCharCode(65 + idx) }}
                  </span>
                </div>
                <div>
                  <p class="text-[14px] font-bold text-[#0f172a]">
                    Cliente
                  </p>
                  <p class="text-[12px] text-[#64748b]">
                    {{ formatRelative(review.createdAt) }}
                  </p>
                </div>
              </div>
              <div class="flex items-center gap-0.5">
                <UIcon
                  v-for="star in 5"
                  :key="star"
                  name="i-lucide-star"
                  class="size-[13px]"
                  :class="star <= review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-neutral-300'"
                />
              </div>
            </div>
            <p class="text-[14px] text-[#475569] leading-[20px]">
              {{ review.comment }}
            </p>
          </div>
        </div>
      </section>

      <!-- ── Cerrar sesión (solo modo own) ── -->
      <section
        v-if="mode === 'own'"
        class="px-5 pb-6"
      >
        <button
          class="flex items-center justify-center gap-2 bg-[#fef2f2] p-3 rounded-xl w-full transition active:bg-red-100"
          @click="logout"
        >
          <UIcon
            name="i-lucide-log-out"
            class="size-[13.5px] text-[#dc2626]"
          />
          <span class="text-[14px] font-bold text-[#dc2626]">Cerrar sesión</span>
        </button>
      </section>
    </main>

    <!-- ── Contratar ahora (solo modo client) ── -->
    <div
      v-if="mode === 'client'"
      class="fixed bottom-0 left-0 right-0 z-20 bg-white border-t border-[#f1f5f9] shadow-[0px_-4px_6px_-1px_rgba(0,0,0,0.05)]"
    >
      <div class="flex items-center gap-4 px-4 pt-4 pb-safe">
        <button class="flex-1 bg-primary-600 rounded-lg h-12 flex items-center justify-center gap-2 shadow-[0px_10px_15px_-3px_rgba(59,130,246,0.2)] transition active:scale-[0.98]">
          <span class="text-[16px] font-bold text-white">
            Contratar ahora
          </span>
          <UIcon
            name="i-lucide-arrow-right"
            class="size-[14px] text-white"
          />
        </button>
      </div>
    </div>
  </div>
</template>
