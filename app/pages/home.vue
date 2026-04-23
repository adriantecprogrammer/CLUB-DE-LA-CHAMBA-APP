<script setup lang="ts">
import type { ILogin } from '~/interfaces/Ilogin'
import type { ICategories } from '~/interfaces/ICategories'
import categoriesApi from '~/services/categoriesApi'

const session = ref<ILogin | null>(null)
const activeTab = ref('inicio')

// --- Location ---
const { cityName, locationLoading, fetchLocation } = useLocation()

// --- Categories ---
const apiCategories = ref<ICategories[]>([])
const categoriesLoading = ref(false)

const DEFAULT_STYLE = { icon: 'i-lucide-briefcase', bg: 'bg-slate-100', color: 'text-slate-400' }

const CATEGORY_KEYWORDS = [
  { keywords: ['font', 'plom', 'agua', 'tuber', 'sanitario'], icon: 'i-lucide-droplets', bg: 'bg-blue-50', color: 'text-blue-500' },
  { keywords: ['elec', 'luz', 'volt', 'cable'], icon: 'i-lucide-zap', bg: 'bg-yellow-50', color: 'text-yellow-500' },
  { keywords: ['cerr', 'llave', 'chapa', 'puerta'], icon: 'i-lucide-key', bg: 'bg-slate-100', color: 'text-slate-500' },
  { keywords: ['limp', 'aseo', 'higiene'], icon: 'i-lucide-sparkles', bg: 'bg-purple-50', color: 'text-purple-500' },
  { keywords: ['carp', 'madera', 'mueble'], icon: 'i-lucide-hammer', bg: 'bg-orange-50', color: 'text-orange-500' },
  { keywords: ['pint', 'color', 'barniz'], icon: 'i-lucide-paint-bucket', bg: 'bg-pink-50', color: 'text-pink-500' },
  { keywords: ['jard', 'plant', 'poda', 'pasto'], icon: 'i-lucide-leaf', bg: 'bg-green-50', color: 'text-green-500' },
  { keywords: ['mud', 'transport', 'fletes'], icon: 'i-lucide-truck', bg: 'bg-indigo-50', color: 'text-indigo-500' },
  { keywords: ['clima', 'aire', 'calef', 'hvac'], icon: 'i-lucide-thermometer', bg: 'bg-cyan-50', color: 'text-cyan-500' },
  { keywords: ['gas'], icon: 'i-lucide-flame', bg: 'bg-red-50', color: 'text-red-500' },
  { keywords: ['alarm', 'camara', 'segur', 'cctv'], icon: 'i-lucide-shield', bg: 'bg-sky-50', color: 'text-sky-500' }
]

function getCategoryStyle(name: string) {
  const lower = name.toLowerCase()
  const match = CATEGORY_KEYWORDS.find(({ keywords }) => keywords.some(k => lower.includes(k)))
  return match ?? DEFAULT_STYLE
}

const displayedCategories = computed(() => apiCategories.value.slice(0, 5))
const hasMoreCategories = computed(() => apiCategories.value.length > 5)

async function fetchCategories() {
  categoriesLoading.value = true
  try {
    apiCategories.value = await categoriesApi.getCategories()
  } catch (err) {
    console.error('Error al cargar categorías:', err)
  } finally {
    categoriesLoading.value = false
  }
}

// --- Providers (mock — pending real endpoint) ---
const providers = [
  { initials: 'JD', name: 'Juan Domínguez', specialty: 'Fontanero Experto', rating: 4.9, distance: '1.2 km de ti', price: '35€', online: true },
  { initials: 'SS', name: 'Sara Sánchez', specialty: 'Limpieza Profunda', rating: 4.7, distance: '2.0 km de ti', price: '25€', online: false },
  { initials: 'MR', name: 'Miguel Ruiz', specialty: 'Electricista Maestro', rating: 5.0, distance: '3.5 km de ti', price: '45€', online: true }
]

onMounted(() => {
  const raw = localStorage.getItem('session')
  if (!raw) {
    navigateTo('/')
    return
  }
  session.value = JSON.parse(raw) as ILogin
  fetchLocation()
  fetchCategories()
})

const user = computed(() => session.value?.user ?? null)
</script>

<template>
  <div
    v-if="user"
    class="bg-[#f8f9fc] min-h-screen font-[Manrope,sans-serif]"
  >
    <HomeHeader
      :city-name="cityName"
      :location-loading="locationLoading"
    />

    <main class="pb-[100px]">
      <!-- Search bar -->
      <div class="px-5 pt-4">
        <div class="relative bg-white rounded-xl border border-[#f3f4f6] shadow-[0px_4px_20px_-2px_rgba(19,109,236,0.08)] px-4 py-[17px] flex items-center gap-3">
          <UIcon
            name="i-lucide-search"
            class="size-[18px] text-neutral-400 shrink-0"
          />
          <span class="text-neutral-400 text-base flex-1">
            ¿Qué servicio necesitas?
          </span>
          <button class="p-2 shrink-0">
            <UIcon
              name="i-lucide-sliders-horizontal"
              class="size-[18px] text-neutral-400"
            />
          </button>
        </div>
      </div>

      <!-- Categorías -->
      <section class="pt-6 px-5">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-[20px] font-bold text-[#0d131b]">
            Categorías
          </h2>
          <button class="text-[14px] font-semibold text-primary-600">
            Ver todo
          </button>
        </div>

        <!-- Skeleton -->
        <div
          v-if="categoriesLoading"
          class="grid grid-cols-3 gap-3"
        >
          <div
            v-for="n in 6"
            :key="n"
            class="bg-white border border-[#f3f4f6] rounded-2xl flex flex-col items-center gap-3 py-[17px] animate-pulse"
          >
            <div class="size-12 rounded-full bg-neutral-100" />
            <div class="h-3 w-14 rounded bg-neutral-100" />
          </div>
        </div>

        <!-- Real categories -->
        <div
          v-else
          class="grid grid-cols-3 gap-3"
        >
          <button
            v-for="cat in displayedCategories"
            :key="cat.id"
            class="bg-white border border-[#f3f4f6] rounded-2xl shadow-[0px_2px_8px_0px_rgba(0,0,0,0.04)] flex flex-col items-center gap-3 py-[17px] transition active:scale-95"
          >
            <div
              class="size-12 rounded-full flex items-center justify-center"
              :class="getCategoryStyle(cat.name).bg"
            >
              <UIcon
                :name="getCategoryStyle(cat.name).icon"
                class="size-5"
                :class="getCategoryStyle(cat.name).color"
              />
            </div>
            <span class="text-[12px] font-semibold text-[#0d131b] text-center leading-4 px-1">
              {{ cat.name }}
            </span>
          </button>

          <!-- Más slot -->
          <button
            v-if="hasMoreCategories || displayedCategories.length > 0"
            class="bg-white border border-[#f3f4f6] rounded-2xl shadow-[0px_2px_8px_0px_rgba(0,0,0,0.04)] flex flex-col items-center gap-3 py-[17px] transition active:scale-95"
          >
            <div class="size-12 rounded-full bg-emerald-50 flex items-center justify-center">
              <UIcon
                name="i-lucide-more-horizontal"
                class="size-5 text-emerald-500"
              />
            </div>
            <span class="text-[12px] font-semibold text-[#0d131b] text-center leading-4">
              Más
            </span>
          </button>
        </div>
      </section>

      <!-- Profesionales cercanos -->
      <section class="pt-6">
        <div class="flex items-center justify-between mb-4 px-5">
          <h2 class="text-[20px] font-bold text-[#0d131b]">
            Profesionales cercanos
          </h2>
          <button class="text-[14px] font-semibold text-primary-600 shrink-0">
            Ver todo
          </button>
        </div>

        <div class="flex gap-4 overflow-x-auto px-5 pb-6 scrollbar-hide snap-x snap-mandatory">
          <div
            v-for="provider in providers"
            :key="provider.name"
            class="bg-white border border-[#f3f4f6] rounded-2xl shadow-[0px_4px_20px_-2px_rgba(19,109,236,0.08)] p-[17px] flex flex-col gap-4 shrink-0 w-[280px] snap-start"
          >
            <div class="flex items-start gap-4">
              <div class="relative shrink-0">
                <div class="size-16 rounded-full border-2 border-white shadow-sm bg-primary-600 flex items-center justify-center">
                  <span class="text-white text-lg font-bold">
                    {{ provider.initials }}
                  </span>
                </div>
                <span
                  class="absolute -bottom-1 -right-1 size-4 rounded-full border-2 border-white"
                  :class="provider.online ? 'bg-green-500' : 'bg-neutral-400'"
                />
              </div>

              <div class="flex-1 min-w-0">
                <div class="flex items-start justify-between mb-0.5">
                  <span class="text-[16px] font-bold text-[#0d131b] truncate pr-2">
                    {{ provider.name }}
                  </span>
                  <div class="flex items-center gap-1 bg-yellow-50 px-1.5 py-0.5 rounded shrink-0">
                    <UIcon
                      name="i-lucide-star"
                      class="size-3 text-yellow-600 fill-yellow-600"
                    />
                    <span class="text-[12px] font-bold text-yellow-700">
                      {{ provider.rating }}
                    </span>
                  </div>
                </div>
                <p class="text-[14px] text-neutral-500">
                  {{ provider.specialty }}
                </p>
                <div class="flex items-center gap-1 mt-1.5">
                  <UIcon
                    name="i-lucide-navigation"
                    class="size-3 text-neutral-400"
                  />
                  <span class="text-[12px] text-neutral-500">
                    {{ provider.distance }}
                  </span>
                </div>
              </div>
            </div>

            <div class="border-t border-[#f9fafb] pt-3 flex items-center justify-between">
              <div class="flex items-baseline gap-0.5">
                <span class="text-[18px] font-bold text-primary-600">
                  {{ provider.price }}
                </span>
                <span class="text-[12px] text-neutral-500">/hr</span>
              </div>
              <button class="bg-primary-600 text-white text-[14px] font-semibold px-4 py-2 rounded-lg shadow-[0px_1px_2px_0px_#bfdbfe] transition active:scale-95">
                Reservar
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- Oferta especial -->
      <div class="mx-5">
        <div class="relative rounded-2xl overflow-hidden shadow-[0px_4px_20px_-2px_rgba(19,109,236,0.08)]">
          <div class="absolute inset-0 bg-linear-to-r from-[rgba(11,76,181,0.9)] to-[rgba(19,109,236,0.6)]" />
          <div class="relative p-6 flex flex-col items-start">
            <span class="text-[12px] font-bold tracking-widest uppercase text-white/80 mb-2">
              Oferta Limitada
            </span>
            <h3 class="text-[20px] font-bold text-white leading-tight mb-4">
              20% dto. en tu<br>primera limpieza
            </h3>
            <button class="bg-white text-primary-600 text-[12px] font-bold px-4 py-2 rounded-lg transition active:scale-95">
              Reclamar
            </button>
          </div>
        </div>
      </div>
    </main>

    <HomeBottomNav v-model="activeTab" />
  </div>
</template>

<style scoped>
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
