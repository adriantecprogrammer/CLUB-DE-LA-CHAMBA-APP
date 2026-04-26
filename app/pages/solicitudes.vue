<script setup lang="ts">
import type { IRequests } from '~/interfaces/IRequests'
import requestClientApi from '~/services/requestClientApi'

definePageMeta({ middleware: 'auth' })

const { user } = useAuth()

const requests = ref<IRequests[]>([])
const loading = ref(false)
const activeFilter = ref<'activas' | 'pasadas'>('activas')

// ── Status config ──────────────────────────────────────────────
const STATUS_CONFIG: Record<string, { label: string; dotBg: string; badgeBg: string; badgeColor: string }> = {
  pending:     { label: 'Pendiente',  dotBg: 'bg-[#fef3c7]', badgeBg: 'bg-[#fffbeb]', badgeColor: 'text-[#d97706]'  },
  in_progress: { label: 'En curso',   dotBg: 'bg-[#dbeafe]', badgeBg: 'bg-[#eff6ff]', badgeColor: 'text-[#136dec]'  },
  accepted:    { label: 'Aceptado',   dotBg: 'bg-[#d1fae5]', badgeBg: 'bg-[#ecfdf5]', badgeColor: 'text-[#059669]'  },
  completed:   { label: 'Completado', dotBg: 'bg-[#d1fae5]', badgeBg: 'bg-[#ecfdf5]', badgeColor: 'text-[#059669]'  },
  cancelled:   { label: 'Cancelado',  dotBg: 'bg-[#fee2e2]', badgeBg: 'bg-[#fef2f2]', badgeColor: 'text-[#dc2626]'  },
}

function getStatusConfig(status: string) {
  return STATUS_CONFIG[status] ?? { label: status, dotBg: 'bg-neutral-100', badgeBg: 'bg-neutral-50', badgeColor: 'text-neutral-500' }
}

// ── Icon from title keywords ───────────────────────────────────
const ICON_KEYWORDS = [
  { keywords: ['font', 'plom', 'agua', 'tuber'],         icon: 'i-lucide-droplets'    },
  { keywords: ['elec', 'luz', 'volt', 'cable', 'revis'], icon: 'i-lucide-zap'          },
  { keywords: ['limp', 'aseo', 'bañ', 'baño'],           icon: 'i-lucide-sparkles'     },
  { keywords: ['carp', 'madera', 'mueble'],               icon: 'i-lucide-hammer'       },
  { keywords: ['pint', 'color', 'barniz'],                icon: 'i-lucide-paint-bucket' },
  { keywords: ['jard', 'plant', 'poda', 'pasto'],        icon: 'i-lucide-leaf'         },
  { keywords: ['mud', 'transport', 'flete'],              icon: 'i-lucide-truck'        },
  { keywords: ['clima', 'aire', 'a/c', 'ac', 'reparac'], icon: 'i-lucide-wind'         },
  { keywords: ['gas'],                                    icon: 'i-lucide-flame'        },
  { keywords: ['alarm', 'segur', 'camara'],              icon: 'i-lucide-shield'       },
]

function getIcon(title: string) {
  const lower = title.toLowerCase()
  const match = ICON_KEYWORDS.find(({ keywords }) => keywords.some(k => lower.includes(k)))
  return match?.icon ?? 'i-lucide-briefcase'
}

// ── Filters ────────────────────────────────────────────────────
const ACTIVE_STATUSES  = ['pending', 'in_progress', 'accepted']
const PAST_STATUSES    = ['completed', 'cancelled']

const filteredRequests = computed(() =>
  requests.value.filter(r =>
    activeFilter.value === 'activas'
      ? ACTIVE_STATUSES.includes(r.status)
      : PAST_STATUSES.includes(r.status)
  )
)

// ── Helpers ────────────────────────────────────────────────────
function formatSchedule(scheduledAt: string | null, status: string): string {
  if (!scheduledAt) return status === 'pending' ? 'Esperando Aprobación' : 'Sin fecha programada'
  const date     = new Date(scheduledAt)
  const today    = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(today.getDate() + 1)
  const time = date.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })
  if (date.toDateString() === today.toDateString())    return `Hoy, ${time}`
  if (date.toDateString() === tomorrow.toDateString()) return `Mañana, ${time}`
  return date.toLocaleDateString('es-MX', { day: '2-digit', month: 'short' }) + ', ' + time
}

function formatId(id: string) {
  return `#SR-${id.slice(-4).toUpperCase()}`
}

function isScheduleIcon(scheduledAt: string | null) {
  return scheduledAt !== null
}

// ── Fetch ──────────────────────────────────────────────────────
async function fetchRequests() {
  if (!user.value?.id) return
  loading.value = true
  try {
    requests.value = await requestClientApi.getRequestByUserId(user.value.id)
  } catch (err) {
    console.error('Error al cargar solicitudes:', err)
  } finally {
    loading.value = false
  }
}

// ── Nav ────────────────────────────────────────────────────────
const activeTab = ref('solicitudes')
watch(activeTab, (val) => {
  if (val !== 'solicitudes') navigateTo('/home')
})

onMounted(fetchRequests)
</script>

<template>
  <div class="bg-white min-h-screen font-[Manrope,sans-serif] flex flex-col">
    <!-- Header -->
    <header class="bg-white flex items-center justify-between px-4 pt-6 pb-4">
      <button
        class="size-10 flex items-center justify-center rounded-full"
        @click="navigateTo('/home')"
      >
        <UIcon
          name="i-lucide-arrow-left"
          class="size-4 text-[#0f172a]"
        />
      </button>
      <h1 class="text-[18px] font-bold text-[#0f172a]">
        Mis Solicitudes
      </h1>
      <button class="text-[14px] font-bold text-primary-600">
        Ayuda
      </button>
    </header>

    <!-- Filter tabs -->
    <div class="bg-white border-b border-[#f1f5f9] px-4 pb-[13px] pt-3">
      <div class="bg-[#f1f5f9] rounded-xl p-1 flex relative">
        <!-- Sliding indicator -->
        <div
          class="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white rounded-lg shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] transition-all duration-200"
          :class="activeFilter === 'activas' ? 'left-1' : 'left-[calc(50%+3px)]'"
        />
        <button
          class="relative flex-1 py-2 text-[14px] text-center transition-colors duration-200 z-10"
          :class="activeFilter === 'activas' ? 'font-semibold text-[#0f172a]' : 'font-medium text-[#64748b]'"
          @click="activeFilter = 'activas'"
        >
          Activas
        </button>
        <button
          class="relative flex-1 py-2 text-[14px] text-center transition-colors duration-200 z-10"
          :class="activeFilter === 'pasadas' ? 'font-semibold text-[#0f172a]' : 'font-medium text-[#64748b]'"
          @click="activeFilter = 'pasadas'"
        >
          Pasadas
        </button>
      </div>
    </div>

    <!-- Content -->
    <main class="flex-1 px-4 pt-4 pb-[100px] flex flex-col gap-0 bg-white">
      <!-- Skeleton -->
      <template v-if="loading">
        <div
          v-for="n in 3"
          :key="n"
          class="flex gap-4 mb-8"
        >
          <div class="flex flex-col items-center pt-1 shrink-0">
            <div class="size-10 rounded-full bg-neutral-100 animate-pulse" />
            <div class="w-0.5 flex-1 mt-2 bg-neutral-100 rounded-full animate-pulse min-h-[60px]" />
          </div>
          <div class="flex-1 bg-white border border-[#f1f5f9] rounded-xl p-4 flex flex-col gap-2 animate-pulse">
            <div class="h-4 w-2/3 bg-neutral-100 rounded" />
            <div class="h-3 w-1/3 bg-neutral-100 rounded" />
            <div class="h-3 w-1/2 bg-neutral-100 rounded mt-1" />
          </div>
        </div>
      </template>

      <!-- Empty -->
      <div
        v-else-if="filteredRequests.length === 0"
        class="flex flex-col items-center justify-center gap-5 px-6 pt-16 text-center"
      >
        <div class="relative">
          <div class="size-28 rounded-full bg-primary-50 flex items-center justify-center">
            <UIcon
              name="i-lucide-clipboard-list"
              class="size-12 text-primary-300"
            />
          </div>
          <div class="absolute -bottom-1 -right-1 size-9 rounded-full bg-yellow-50 border-2 border-white flex items-center justify-center">
            <UIcon
              name="i-lucide-plus"
              class="size-4 text-yellow-500"
            />
          </div>
        </div>
        <div class="flex flex-col gap-2">
          <p class="text-[20px] font-extrabold text-[#0f172a] leading-tight">
            {{ activeFilter === 'activas' ? 'Sin solicitudes activas' : 'Sin solicitudes pasadas' }}
          </p>
          <p class="text-[14px] text-[#64748b] leading-relaxed max-w-[260px]">
            {{ activeFilter === 'activas' ? 'Cuando pidas un servicio, podrás seguir el estado desde aquí.' : 'Tus servicios completados o cancelados aparecerán aquí.' }}
          </p>
        </div>
        <button
          class="mt-1 flex items-center gap-2 bg-primary-600 text-white text-[14px] font-bold px-6 py-3 rounded-xl shadow-[0px_4px_16px_-2px_rgba(19,109,236,0.35)] transition active:scale-95"
          @click="navigateTo('/home')"
        >
          <UIcon
            name="i-lucide-search"
            class="size-4"
          />
          Explorar servicios
        </button>
      </div>

      <!-- Timeline list -->
      <template v-else>
        <div
          v-for="(req, index) in filteredRequests"
          :key="req.id"
          class="flex gap-4"
        >
          <!-- Timeline dot + line -->
          <div class="flex flex-col items-center pt-1 shrink-0">
            <!-- Dot -->
            <div
              class="size-10 rounded-full flex items-center justify-center z-10 relative shrink-0"
              :class="getStatusConfig(req.status).dotBg"
              style="box-shadow: 0 0 0 4px white"
            >
              <UIcon
                :name="getIcon(req.title)"
                class="size-[18px]"
                :class="getStatusConfig(req.status).badgeColor"
              />
            </div>
            <!-- Vertical line -->
            <div
              class="w-0.5 flex-1 mt-2 rounded-full min-h-[32px]"
              :class="index === filteredRequests.length - 1
                ? 'bg-gradient-to-b from-[#e2e8f0] to-transparent'
                : 'bg-[#e2e8f0]'"
            />
          </div>

          <!-- Card -->
          <div class="flex-1 min-w-0 pb-8">
            <div
              class="bg-white border border-[#f1f5f9] rounded-xl p-[17px] flex flex-col gap-3 drop-shadow-[0px_1px_1px_rgba(0,0,0,0.05)]"
              :class="{ 'opacity-90': req.status === 'pending' }"
            >
              <!-- Title + badge -->
              <div class="flex items-start justify-between gap-2">
                <div class="flex flex-col gap-1">
                  <p class="text-[16px] font-bold text-[#0f172a] leading-6">
                    {{ req.title }}
                  </p>
                  <p class="text-[14px] text-[#64748b]">
                    ID: {{ formatId(req.id) }}
                  </p>
                </div>
                <span
                  class="text-[12px] font-semibold px-[10px] py-1 rounded-full shrink-0"
                  :class="[getStatusConfig(req.status).badgeBg, getStatusConfig(req.status).badgeColor]"
                >
                  {{ getStatusConfig(req.status).label }}
                </span>
              </div>

              <!-- Schedule -->
              <div class="flex items-center gap-2">
                <UIcon
                  :name="isScheduleIcon(req.scheduledAt) ? 'i-lucide-clock' : 'i-lucide-hourglass'"
                  class="size-[15px] text-[#475569] shrink-0"
                />
                <span class="text-[14px] text-[#475569]">{{ formatSchedule(req.scheduledAt, req.status) }}</span>
              </div>

              <!-- Divider + bottom row -->
              <div class="border-t border-[#f1f5f9] pt-3">
                <!-- Pending: note text -->
                <template v-if="req.status === 'pending'">
                  <p class="text-[12px] text-[#94a3b8] leading-4">
                    Solicitud enviada. Esperando confirmación de proveedores.
                  </p>
                </template>

                <!-- Provider assigned + in progress → Rastrear -->
                <template v-else-if="req.status === 'in_progress' && req.providerId">
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2">
                      <div class="size-8 rounded-full bg-[#f1f5f9] border border-[#e2e8f0] flex items-center justify-center shrink-0">
                        <UIcon
                          name="i-lucide-user"
                          class="size-4 text-[#64748b]"
                        />
                      </div>
                      <span class="text-[14px] font-medium text-[#0f172a]">Profesional</span>
                    </div>
                    <button class="bg-primary-600 text-white text-[12px] font-bold px-4 py-2 rounded-lg shadow-[0px_1px_1px_rgba(0,0,0,0.05)] transition active:scale-95">
                      Rastrear
                    </button>
                  </div>
                </template>

                <!-- Accepted or in_progress without provider → Asignando -->
                <template v-else>
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2">
                      <div class="size-8 rounded-full bg-[#f1f5f9] flex items-center justify-center shrink-0">
                        <span class="text-[12px] font-bold text-[#64748b]">?</span>
                      </div>
                      <span class="text-[14px] font-medium text-[#64748b] leading-5">
                        Asignando<br>Profesional...
                      </span>
                    </div>
                    <button class="border border-[#e2e8f0] text-[#334155] text-[12px] font-bold px-4 py-2 rounded-lg leading-4 transition active:scale-95">
                      Ver<br>Detalles
                    </button>
                  </div>
                </template>
              </div>
            </div>
          </div>
        </div>

        <!-- CTA dashed card -->
        <div class="bg-[#f8fafc] border-2 border-dashed border-[#e2e8f0] rounded-xl flex flex-col items-center py-8 px-6 mt-2 gap-2">
          <div class="size-10 rounded-lg bg-white shadow-[0px_1px_3px_rgba(0,0,0,0.1)] flex items-center justify-center mb-1">
            <UIcon
              name="i-lucide-plus"
              class="size-5 text-primary-600"
            />
          </div>
          <p class="text-[14px] font-bold text-[#0f172a]">
            ¿Necesitas algo más?
          </p>
          <p class="text-[12px] text-[#64748b] text-center">
            Reserva un nuevo servicio fácilmente
          </p>
          <button
            class="text-[12px] font-bold text-primary-600 mt-1 transition active:opacity-70"
            @click="navigateTo('/home')"
          >
            Explorar Servicios
          </button>
        </div>
      </template>
    </main>

    <HomeBottomNav v-model="activeTab" />
  </div>
</template>
