<script setup lang="ts">
import type { IProviderCompleteData } from '~/interfaces/IProvider'
import type { ICategories } from '~/interfaces/ICategories'
import providersApi from '~/services/providersApi'
import requestClientApi from '~/services/requestClientApi'
import categoriesApi from '~/services/categoriesApi'

definePageMeta({ middleware: ['auth'] })

const route = useRoute()
const router = useRouter()
const providerUserId = route.params.id as string
const { user } = useAuth()
const toast = useToast()

const provider = ref<IProviderCompleteData | null>(null)
const loading = ref(true)

async function fetchProvider() {
  loading.value = true
  try {
    provider.value = await providersApi.getProviderCompleteDataByUserId(providerUserId)
  } catch (err) {
    console.error('Error al cargar provider:', err)
  } finally {
    loading.value = false
  }
}

// ── Categories (from provider, read-only) ──
const providerCategory = ref<ICategories | null>(null)
const selectedCategoryId = computed(() => providerCategory.value?.id ?? '')
const selectedCategoryName = computed(() => providerCategory.value?.name ?? '')

async function fetchProviderCategory() {
  if (!provider.value?.provider?.id) return
  try {
    const cats = await categoriesApi.getProviderCategories(provider.value.provider.id)
    providerCategory.value = cats[0] ?? null
  } catch (err) {
    console.error('Error al cargar categoría del provider:', err)
  }
}

// ── Location ──
const { fullAddress, latitude, longitude, locationLoading, fetchLocation } = useLocation()

const mapUrl = computed(() => {
  if (!latitude.value || !longitude.value) return ''
  const d = 0.005
  const bbox = `${longitude.value - d},${latitude.value - d},${longitude.value + d},${latitude.value + d}`
  return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${latitude.value},${longitude.value}`
})

// ── Form ──
const description = ref('')
const descriptionLimit = 500
const locationAddress = computed({
  get: () => fullAddress.value,
  set: (val: string) => { fullAddress.value = val }
})
const submitting = ref(false)

async function submitRequest() {
  if (!user.value?.id || !provider.value?.provider?.id || !selectedCategoryId.value) return

  submitting.value = true
  try {
    await requestClientApi.createRequest({
      clientId: user.value.id,
      providerId: provider.value.provider.id,
      categoryId: selectedCategoryId.value,
      title: selectedCategoryName.value,
      description: description.value,
      locationAddress: locationAddress.value,
      locationLat: latitude.value,
      locationLng: longitude.value,
      estimatedPrice: 0
    })
    toast.add({ title: 'Solicitud enviada', description: 'Tu solicitud fue enviada exitosamente', color: 'success' })
    await new Promise(r => setTimeout(r, 1500))
    router.push('/home')
  } catch (err) {
    console.error('Error al crear solicitud:', err)
    toast.add({ title: 'Error', description: 'No se pudo enviar la solicitud', color: 'error' })
  } finally {
    submitting.value = false
  }
}

function handleBack() {
  if (window.history.length > 1) {
    router.back()
  } else {
    navigateTo('/home')
  }
}

onMounted(async () => {
  await fetchProvider()
  fetchProviderCategory()
  fetchLocation()
})
</script>

<template>
  <div class="bg-[#f6f7f8] min-h-screen font-[Manrope,sans-serif]">
    <!-- ── Header ── -->
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
        Solicitar Servicio
      </h1>
      <div class="size-10" />
    </header>

    <!-- ── Loading ── -->
    <div
      v-if="loading"
      class="p-5 animate-pulse flex flex-col gap-4"
    >
      <div class="h-20 rounded-xl bg-white" />
      <div class="h-48 rounded-xl bg-white" />
      <div class="h-44 rounded-xl bg-white" />
      <div class="h-56 rounded-xl bg-white" />
    </div>

    <!-- ── Content ── -->
    <div
      v-else
      class="flex flex-col gap-2 pt-2 pb-[120px]"
    >
      <!-- ── Service type card (read-only) ── -->
      <div class="mx-4 bg-white border border-[#f1f5f9] rounded-xl flex items-center gap-4 p-[17px] shadow-[0px_1px_1px_rgba(0,0,0,0.05)]">
        <div class="size-12 rounded-lg bg-[rgba(19,109,236,0.1)] flex items-center justify-center shrink-0">
          <UIcon
            name="i-lucide-wrench"
            class="size-5 text-[#136dec]"
          />
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-[12px] font-medium text-[#64748b] uppercase tracking-[0.6px]">
            Tipo de Servicio
          </p>
          <p class="text-[16px] font-bold text-[#0f172a] truncate">
            {{ selectedCategoryName || 'Cargando...' }}
          </p>
        </div>
        <UIcon
          name="i-lucide-lock"
          class="size-4 text-[#94a3b8] shrink-0"
        />
      </div>

      <!-- ── Description ── -->
      <div class="flex flex-col gap-3 px-4 pt-4 pb-2">
        <h3 class="text-[18px] font-bold text-[#0f172a]">
          Descripción del problema
        </h3>
        <div class="relative">
          <textarea
            v-model="description"
            :maxlength="descriptionLimit"
            placeholder="Por favor, describe el problema en detalle. Por ejemplo: El fregadero de la cocina gotea por la tubería inferior..."
            class="w-full min-h-[160px] bg-white border border-[#e2e8f0] rounded-xl p-4 pb-12 text-[16px] text-[#0f172a] placeholder-[#94a3b8] font-[Manrope,sans-serif] resize-none focus:outline-none focus:ring-2 focus:ring-primary-600/20 focus:border-primary-600 shadow-[0px_1px_2px_rgba(0,0,0,0.05)]"
          />
          <span class="absolute bottom-3 right-4 text-[12px] font-medium text-[#94a3b8] bg-white px-1 rounded">
            {{ description.length }}/{{ descriptionLimit }}
          </span>
        </div>
      </div>

      <!-- ── Location ── -->
      <div class="flex flex-col gap-3 px-4 pt-2 pb-4">
        <div class="flex items-center justify-between">
          <h3 class="text-[18px] font-bold text-[#0f172a]">
            Ubicación del Servicio
          </h3>
          <button class="flex items-center gap-1 text-[14px] font-semibold text-[#136dec]">
            <UIcon
              name="i-lucide-map-pin"
              class="size-[13px]"
            />
            Editar
          </button>
        </div>
        <div class="bg-white border border-[#e2e8f0] rounded-xl overflow-hidden shadow-[0px_1px_2px_rgba(0,0,0,0.05)]">
          <!-- Map -->
          <div class="h-56 bg-[#e2e8f0] relative overflow-hidden">
            <iframe
              v-if="mapUrl"
              :src="mapUrl"
              class="size-full border-0"
              loading="lazy"
            />
            <div
              v-else
              class="size-full flex items-center justify-center"
            >
              <div
                v-if="locationLoading"
                class="size-5 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"
              />
              <UIcon
                v-else
                name="i-lucide-map-pin"
                class="size-8 text-primary-600"
              />
            </div>
          </div>
          <!-- Address -->
          <div class="flex gap-3 p-4">
            <UIcon
              name="i-lucide-home"
              class="size-5 text-[#64748b] shrink-0 mt-0.5"
            />
            <div class="flex-1">
              <p class="text-[14px] font-bold text-[#0f172a]">
                Casa
              </p>
              <input
                v-model="locationAddress"
                placeholder="Ingresa la dirección del servicio"
                class="w-full text-[14px] text-[#475569] bg-transparent focus:outline-none placeholder-[#94a3b8]"
              >
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ── Fixed bottom button ── -->
    <div class="fixed bottom-0 left-0 right-0 z-20 bg-white border-t border-[#f1f5f9] pt-[17px] pb-8 px-4 shadow-[0px_-4px_6px_-1px_rgba(0,0,0,0.05)]">
      <button
        class="w-full h-12 bg-[#136dec] rounded-xl flex items-center justify-center gap-2 shadow-[0px_10px_15px_-3px_rgba(19,109,236,0.3),0px_4px_6px_-4px_rgba(19,109,236,0.3)] transition active:scale-[0.98] disabled:opacity-50"
        :disabled="submitting || !selectedCategoryId || !description || !locationAddress"
        @click="submitRequest"
      >
        <span class="text-[16px] font-bold text-white">
          {{ submitting ? 'Enviando...' : 'Solicitar Servicio' }}
        </span>
        <UIcon
          name="i-lucide-arrow-right"
          class="size-[13px] text-white"
        />
      </button>
    </div>

  </div>
</template>
