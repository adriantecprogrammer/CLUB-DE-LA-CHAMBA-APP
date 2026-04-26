<script setup lang="ts">
import type { ICategories } from '~/interfaces/ICategories'
import type { IProviders } from '~/interfaces/IProvider'
import type { IUser } from '~/interfaces/IUser'
import categoriesApi from '~/services/categoriesApi'
import providersApi from '~/services/providersApi'
import userApi from '~/services/usetApi'

definePageMeta({ middleware: 'auth' })

type ProviderWithUser = IProviders & { user: IUser | null }

const { user } = useAuth()
const searchQuery = ref('')
const searchInput = ref<HTMLInputElement | null>(null)

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

const filteredCategories = computed(() => {
  const query = searchQuery.value.toLowerCase().trim()
  if (!query) return apiCategories.value
  return apiCategories.value.filter(cat =>
    cat.name.toLowerCase().includes(query)
  )
})

const displayedCategories = computed(() => filteredCategories.value.slice(0, 6))

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

// --- Providers ---
const providers = ref<ProviderWithUser[]>([])
const providersLoading = ref(false)

const filteredProviders = computed(() => {
  const query = searchQuery.value.toLowerCase().trim()
  if (!query) return providers.value
  return providers.value.filter((p) => {
    const firstName = p.user?.firstName || ''
    const lastName = p.user?.lastName || ''
    const fullName = `${firstName} ${lastName}`.toLowerCase()
    const bio = p.bio?.toLowerCase() || ''
    return fullName.includes(query) || bio.includes(query)
  })
})

async function fetchProviders() {
  providersLoading.value = true
  try {
    const list = await providersApi.getAllProviders()
    providers.value = await Promise.all(
      list.map(async (p) => {
        try {
          const user = await userApi.getUserById(p.userId)
          return { ...p, user }
        } catch {
          return { ...p, user: null }
        }
      })
    )
  } catch (err) {
    console.error('Error al cargar proveedores:', err)
  } finally {
    providersLoading.value = false
  }
}

onMounted(() => {
  fetchCategories()
  fetchProviders()
  // Focus the input
  setTimeout(() => {
    searchInput.value?.focus()
  }, 300)
})

const goBack = () => navigateTo('/home')
</script>

<template>
  <div class="bg-[#f8f9fc] min-h-screen font-[Manrope,sans-serif]">
    <!-- Header -->
    <header class="sticky top-0 z-20 bg-white border-b border-[#f3f4f6] px-4 py-3">
      <div class="flex items-center gap-3">
        <button
          class="p-2 -ml-2 transition active:scale-90"
          @click="goBack"
        >
          <UIcon
            name="i-lucide-arrow-left"
            class="size-6 text-[#0d131b]"
          />
        </button>

        <div class="flex-1 relative bg-[#f3f4f6] rounded-xl px-4 flex items-center gap-3">
          <UIcon
            name="i-lucide-search"
            class="size-[18px] text-neutral-400 shrink-0"
          />
          <input
            ref="searchInput"
            v-model="searchQuery"
            type="text"
            placeholder="¿Qué servicio necesitas?"
            class="bg-transparent border-none focus:ring-0 text-neutral-800 text-[15px] flex-1 py-2.5 placeholder:text-neutral-400 outline-none"
          >
          <button
            v-if="searchQuery"
            class="p-1 shrink-0"
            @click="searchQuery = ''"
          >
            <UIcon
              name="i-lucide-x"
              class="size-4 text-neutral-400"
            />
          </button>
        </div>
      </div>
    </header>

    <main class="pb-10">
      <!-- Suggestions/Results -->
      <div
        v-if="!searchQuery && !categoriesLoading && !providersLoading"
        class="px-5 pt-6"
      >
        <p class="text-[12px] font-bold text-neutral-400 uppercase tracking-widest mb-4">
          Búsquedas populares
        </p>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="tag in ['Limpieza', 'Plomería', 'Electricista', 'Pintura']"
            :key="tag"
            class="bg-white border border-[#f3f4f6] px-4 py-2 rounded-full text-[14px] font-medium text-[#334155] shadow-sm active:scale-95 transition"
            @click="searchQuery = tag"
          >
            {{ tag }}
          </button>
        </div>
      </div>

      <!-- Categories Results -->
      <section
        v-if="filteredCategories.length > 0"
        class="pt-6 px-5"
      >
        <h2 class="text-[16px] font-bold text-[#0d131b] mb-4">
          Categorías {{ searchQuery ? 'encontradas' : '' }}
        </h2>
        <div class="grid grid-cols-3 gap-3">
          <button
            v-for="cat in displayedCategories"
            :key="cat.id"
            class="bg-white border border-[#f3f4f6] rounded-2xl shadow-sm flex flex-col items-center gap-3 py-[17px] transition active:scale-95"
          >
            <div
              class="size-10 rounded-full flex items-center justify-center"
              :class="getCategoryStyle(cat.name).bg"
            >
              <UIcon
                :name="getCategoryStyle(cat.name).icon"
                class="size-5"
                :class="getCategoryStyle(cat.name).color"
              />
            </div>
            <span class="text-[11px] font-semibold text-[#0d131b] text-center leading-4 px-1">
              {{ cat.name }}
            </span>
          </button>
        </div>
      </section>

      <!-- Providers Results -->
      <section class="pt-8">
        <div class="px-5 mb-4">
          <h2 class="text-[16px] font-bold text-[#0d131b]">
            Profesionales {{ searchQuery ? 'que coinciden' : 'destacados' }}
          </h2>
        </div>

        <div
          v-if="providersLoading"
          class="flex flex-col gap-4 px-5"
        >
          <div
            v-for="n in 3"
            :key="n"
            class="bg-white border border-[#f3f4f6] rounded-2xl p-4 animate-pulse"
          >
            <div class="flex items-center gap-4">
              <div class="size-14 rounded-full bg-neutral-100" />
              <div class="flex-1 space-y-2">
                <div class="h-4 w-1/2 bg-neutral-100 rounded" />
                <div class="h-3 w-1/3 bg-neutral-100 rounded" />
              </div>
            </div>
          </div>
        </div>

        <div
          v-else-if="filteredProviders.length > 0"
          class="flex flex-col gap-4 px-5"
        >
          <div
            v-for="provider in filteredProviders"
            :key="provider.id"
            class="bg-white border border-[#f3f4f6] rounded-2xl shadow-sm p-4 flex gap-4 transition active:bg-neutral-50"
          >
            <div class="relative shrink-0">
              <div
                class="size-14 rounded-full flex items-center justify-center text-white text-lg font-bold"
                :class="'bg-primary-600'"
              >
                {{ provider.user?.firstName?.charAt(0) }}{{ provider.user?.lastName?.charAt(0) }}
              </div>
              <div
                v-if="provider.verified"
                class="absolute -bottom-0.5 -right-0.5 size-4 rounded-full bg-primary-600 border-2 border-white flex items-center justify-center"
              >
                <UIcon
                  name="i-lucide-check"
                  class="size-2 text-white"
                />
              </div>
            </div>

            <div class="flex-1 min-w-0">
              <div class="flex items-start justify-between">
                <h3 class="font-bold text-[#0d131b] truncate">
                  {{ provider.user?.firstName }} {{ provider.user?.lastName }}
                </h3>
                <div class="flex items-center gap-1 bg-yellow-50 px-1.5 py-0.5 rounded">
                  <UIcon
                    name="i-lucide-star"
                    class="size-3 text-yellow-600 fill-yellow-600"
                  />
                  <span class="text-[11px] font-bold text-yellow-700">
                    {{ provider.ratingAvg > 0 ? provider.ratingAvg.toFixed(1) : 'Nuevo' }}
                  </span>
                </div>
              </div>
              <p class="text-[13px] text-neutral-500 line-clamp-1 mt-0.5">
                {{ provider.bio }}
              </p>
              <div class="flex items-center gap-3 mt-2">
                <span class="text-[11px] font-medium text-neutral-400">
                  {{ provider.completedJobs }} trabajos
                </span>
                <span class="text-[11px] font-medium text-neutral-400">
                  {{ provider.experienceYears }} años exp.
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty state -->
        <div
          v-else
          class="flex flex-col items-center justify-center py-10 px-10 text-center"
        >
          <div class="size-16 rounded-full bg-neutral-50 flex items-center justify-center mb-4">
            <UIcon
              name="i-lucide-search-x"
              class="size-8 text-neutral-300"
            />
          </div>
          <h3 class="text-[16px] font-bold text-[#0d131b] mb-1">
            No encontramos resultados
          </h3>
          <p class="text-[14px] text-neutral-500">
            Intenta con otras palabras clave o categorías.
          </p>
        </div>
      </section>
    </main>
  </div>
</template>

<style scoped>
.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
