<script setup lang="ts">
import type { IProviders } from '~/interfaces/IProvider'
import type { IUser } from '~/interfaces/IUser'

type ProviderWithUser = IProviders & { user: IUser | null }

defineProps<{
  providers: ProviderWithUser[]
  loading: boolean
}>()

const AVATAR_COLORS = [
  'bg-blue-500',
  'bg-emerald-500',
  'bg-violet-500',
  'bg-orange-500',
  'bg-pink-500',
  'bg-cyan-500'
]

function avatarColor(id: string) {
  return AVATAR_COLORS[id.charCodeAt(0) % AVATAR_COLORS.length]
}

function initials(user: IUser | null) {
  if (!user) return '?'
  return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase()
}

function fullName(user: IUser | null) {
  if (!user) return 'Proveedor'
  return `${user.firstName} ${user.lastName}`
}

function formatRating(avg: number) {
  return avg > 0 ? avg.toFixed(1) : '—'
}
</script>

<template>
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
      <!-- Skeleton -->
      <template v-if="loading">
        <div
          v-for="n in 3"
          :key="n"
          class="bg-white border border-[#f3f4f6] rounded-2xl p-[17px] flex flex-col gap-4 shrink-0 w-[280px] animate-pulse"
        >
          <div class="flex items-start gap-4">
            <div class="size-16 rounded-full bg-neutral-100 shrink-0" />
            <div class="flex-1 flex flex-col gap-2 pt-1">
              <div class="h-4 w-3/4 rounded bg-neutral-100" />
              <div class="h-3 w-1/2 rounded bg-neutral-100" />
              <div class="h-3 w-1/3 rounded bg-neutral-100" />
            </div>
          </div>
          <div class="border-t border-[#f9fafb] pt-3 flex items-center justify-between">
            <div class="h-4 w-20 rounded bg-neutral-100" />
            <div class="h-8 w-24 rounded-lg bg-neutral-100" />
          </div>
        </div>
      </template>

      <!-- Cards reales -->
      <template v-else>
        <div
          v-for="provider in providers"
          :key="provider.id"
          class="bg-white border border-[#f3f4f6] rounded-2xl shadow-[0px_4px_20px_-2px_rgba(19,109,236,0.08)] p-[17px] flex flex-col gap-4 shrink-0 w-[280px] snap-start"
        >
          <!-- Info superior -->
          <div class="flex items-start gap-4">
            <div class="relative shrink-0">
              <div
                class="size-16 rounded-full border-2 border-white shadow-sm flex items-center justify-center text-white text-xl font-bold"
                :class="avatarColor(provider.id)"
              >
                {{ initials(provider.user) }}
              </div>
              <div
                v-if="provider.verified"
                class="absolute -bottom-1 -right-1 size-5 rounded-full bg-primary-600 border-2 border-white flex items-center justify-center"
              >
                <UIcon
                  name="i-lucide-check"
                  class="size-2.5 text-white"
                />
              </div>
            </div>

            <div class="flex-1 min-w-0">
              <div class="flex items-start justify-between mb-1">
                <span class="text-[15px] font-bold text-[#0d131b] truncate pr-2">
                  {{ fullName(provider.user) }}
                </span>
                <div class="flex items-center gap-1 bg-yellow-50 px-1.5 py-0.5 rounded shrink-0">
                  <UIcon
                    name="i-lucide-star"
                    class="size-3 text-yellow-600 fill-yellow-600"
                  />
                  <span class="text-[12px] font-bold text-yellow-700">
                    {{ formatRating(provider.ratingAvg) }}
                  </span>
                </div>
              </div>

              <p class="text-[13px] text-neutral-500 line-clamp-2 leading-snug">
                {{ provider.bio }}
              </p>

              <div class="flex items-center gap-3 mt-2">
                <div class="flex items-center gap-1">
                  <UIcon
                    name="i-lucide-briefcase"
                    class="size-3 text-neutral-400"
                  />
                  <span class="text-[11px] text-neutral-500">
                    {{ provider.experienceYears }} año{{ provider.experienceYears !== 1 ? 's' : '' }}
                  </span>
                </div>
                <div class="flex items-center gap-1">
                  <UIcon
                    name="i-lucide-check-circle"
                    class="size-3 text-neutral-400"
                  />
                  <span class="text-[11px] text-neutral-500">
                    {{ provider.completedJobs }} trabajos
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="border-t border-[#f9fafb] pt-3 flex items-center justify-between">
            <div
              v-if="provider.verified"
              class="flex items-center gap-1"
            >
              <UIcon
                name="i-lucide-shield-check"
                class="size-3.5 text-primary-600"
              />
              <span class="text-[11px] font-semibold text-primary-600">
                Verificado
              </span>
            </div>
            <div v-else />
            <button class="bg-primary-600 text-white text-[14px] font-semibold px-4 py-2 rounded-lg shadow-[0px_1px_2px_0px_#bfdbfe] transition active:scale-95">
              Contactar
            </button>
          </div>
        </div>

        <!-- Empty state -->
        <div
          v-if="!providers.length"
          class="flex flex-col items-center justify-center w-full py-10 text-neutral-400 gap-2"
        >
          <UIcon
            name="i-lucide-users"
            class="size-8"
          />
          <p class="text-sm font-medium">
            No hay profesionales disponibles
          </p>
        </div>
      </template>
    </div>
  </section>
</template>

<style scoped>
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
