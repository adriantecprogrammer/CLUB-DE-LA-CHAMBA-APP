<script setup lang="ts">
import type { ICategories } from '~/interfaces/ICategories'
import type { IProviders } from '~/interfaces/IProvider'
import type { IUser } from '~/interfaces/IUser'
import categoriesApi from '~/services/categoriesApi'
import providersApi from '~/services/providersApi'
import userApi from '~/services/usetApi'

definePageMeta({ middleware: 'auth' })

type ProviderWithUser = IProviders & { user: IUser | null }

const { user, clearSession } = useAuth()
const activeTab = ref('inicio')

const logout = async () => {
  clearSession()
  await navigateTo('/')
}

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

// --- Providers ---
const providers = ref<ProviderWithUser[]>([])
const providersLoading = ref(false)

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
  fetchLocation()
  fetchCategories()
  fetchProviders()
})
</script>

<template>
  <div
    v-if="user"
    class="bg-[#f8f9fc] min-h-screen font-[Manrope,sans-serif]"
  >
    <HomeHeader
      v-if="activeTab !== 'perfil'"
      :city-name="cityName"
      :location-loading="locationLoading"
    />

    <main class="pb-[100px]">
      <!-- ── INICIO ── -->
      <template v-if="activeTab === 'inicio'">
        <!-- Greeting -->
        <div class="px-5 pt-5 pb-1 flex items-center gap-3">
          <div class="size-12 rounded-full bg-primary-600 flex items-center justify-center shrink-0">
            <span class="text-white font-bold text-base uppercase">
              {{ user?.firstName?.charAt(0) }}{{ user?.lastName?.charAt(0) }}
            </span>
          </div>
          <div>
            <p class="text-neutral-400 text-[12px] font-semibold uppercase tracking-widest">
              Bienvenido de vuelta
            </p>
            <h2 class="text-[20px] font-extrabold text-[#0d131b] leading-tight">
              {{ user?.firstName }} {{ user?.lastName }}
            </h2>
          </div>
        </div>

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

        <HomeProvidersCarousel
          :providers="providers"
          :loading="providersLoading"
        />

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
      </template>

      <!-- ── PERFIL ── -->
      <template v-else-if="activeTab === 'perfil'">
        <!-- Header Mi Cuenta -->
        <header class="sticky top-0 z-20 backdrop-blur-sm bg-white/80 border-b border-[#f1f5f9] flex items-center justify-between px-4 py-3">
          <h1 class="text-[20px] font-bold text-[#0f172a] tracking-[-0.5px]">
            Mi Cuenta
          </h1>
          <button class="p-2 rounded-full">
            <UIcon
              name="i-lucide-bell"
              class="size-5 text-[#0f172a]"
            />
          </button>
        </header>

        <div class="flex flex-col gap-2 pb-[135px]">
          <!-- Hero -->
          <div class="flex flex-col items-center pt-8 pb-2 gap-3">
            <!-- Avatar con botón editar -->
            <div class="relative">
              <div class="size-24 rounded-full bg-primary-600 border-4 border-white shadow flex items-center justify-center">
                <span class="text-white font-extrabold text-3xl uppercase">
                  {{ user?.firstName?.charAt(0) }}{{ user?.lastName?.charAt(0) }}
                </span>
              </div>
              <button class="absolute bottom-0 right-0 bg-primary-600 border-2 border-white rounded-full p-2 shadow">
                <UIcon
                  name="i-lucide-pencil"
                  class="size-3 text-white"
                />
              </button>
            </div>
            <!-- Nombre y correo -->
            <div class="flex flex-col items-center gap-1">
              <h2 class="text-[20px] font-bold text-[#0f172a]">
                {{ user?.firstName }} {{ user?.lastName }}
              </h2>
              <p class="text-[14px] font-medium text-[#64748b]">
                {{ user?.email }}
              </p>
            </div>
            <!-- Editar perfil -->
            <button class="flex items-center gap-2 bg-[rgba(19,109,236,0.1)] px-5 py-[10px] rounded-full">
              <UIcon
                name="i-lucide-square-pen"
                class="size-[15px] text-primary-600"
              />
              <span class="text-[14px] font-bold text-primary-600">Editar perfil</span>
            </button>
          </div>

          <!-- Secciones -->
          <div class="flex flex-col gap-6 px-4">
            <!-- GENERAL -->
            <div class="flex flex-col gap-2">
              <p class="px-2 text-[12px] font-bold text-[#94a3b8] uppercase tracking-[0.6px]">
                General
              </p>
              <button class="flex items-center gap-4 p-3 rounded-xl w-full transition active:bg-neutral-50">
                <div class="size-10 rounded-full bg-[#eff6ff] flex items-center justify-center shrink-0">
                  <UIcon
                    name="i-lucide-credit-card"
                    class="size-5 text-primary-600"
                  />
                </div>
                <span class="flex-1 text-left text-[16px] font-medium text-[#334155]">Métodos de pago</span>
                <UIcon
                  name="i-lucide-chevron-right"
                  class="size-4 text-[#94a3b8]"
                />
              </button>
              <button class="flex items-center gap-4 px-3 py-2 rounded-xl w-full transition active:bg-neutral-50">
                <div class="size-10 rounded-full bg-[#f8fafc] flex items-center justify-center shrink-0">
                  <UIcon
                    name="i-lucide-settings"
                    class="size-5 text-[#64748b]"
                  />
                </div>
                <span class="flex-1 text-left text-[16px] font-medium text-[#334155]">Configuración</span>
                <UIcon
                  name="i-lucide-chevron-right"
                  class="size-4 text-[#94a3b8]"
                />
              </button>
            </div>

            <!-- SOPORTE -->
            <div class="flex flex-col gap-2">
              <p class="px-2 text-[12px] font-bold text-[#94a3b8] uppercase tracking-[0.6px]">
                Soporte
              </p>
              <button class="flex items-center gap-4 p-3 rounded-xl w-full transition active:bg-neutral-50">
                <div class="size-10 rounded-full bg-[#ecfdf5] flex items-center justify-center shrink-0">
                  <UIcon
                    name="i-lucide-circle-help"
                    class="size-5 text-emerald-500"
                  />
                </div>
                <span class="flex-1 text-left text-[16px] font-medium text-[#334155]">Ayuda</span>
                <UIcon
                  name="i-lucide-chevron-right"
                  class="size-4 text-[#94a3b8]"
                />
              </button>
            </div>

            <!-- Cerrar sesión + versión -->
            <div class="flex flex-col gap-4 pb-6 pt-2">
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
              <p class="text-center text-[12px] text-[#94a3b8]">
                Versión 2.4.0
              </p>
            </div>
          </div>
        </div>
      </template>
    </main>

    <HomeBottomNav v-model="activeTab" />
  </div>
</template>
