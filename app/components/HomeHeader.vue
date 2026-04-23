<script setup lang="ts">
defineProps<{
  cityName: string
  locationLoading: boolean
}>()
</script>

<template>
  <header class="sticky top-0 z-20 backdrop-blur-sm bg-[rgba(248,249,252,0.95)] border-b border-[#f3f4f6] flex items-center justify-between px-5 py-4">
    <div class="flex items-center gap-3">
      <div class="size-10 rounded-full bg-[rgba(19,109,236,0.1)] flex items-center justify-center shrink-0">
        <UIcon
          v-if="!locationLoading"
          name="i-lucide-map-pin"
          class="size-4 text-primary-600"
        />
        <UIcon
          v-else
          name="i-lucide-loader-circle"
          class="size-4 text-primary-600 animate-spin"
        />
      </div>
      <div class="flex flex-col">
        <span class="text-[10px] font-semibold tracking-widest uppercase text-neutral-400">
          Ubicación actual
        </span>
        <div class="flex items-center gap-1">
          <span
            class="text-[18px] font-bold text-[#0d131b] transition-all"
            :class="locationLoading ? 'opacity-50' : 'opacity-100'"
          >
            {{ locationLoading ? 'Buscando…' : cityName }}
          </span>
          <UIcon
            v-if="!locationLoading"
            name="i-lucide-chevron-down"
            class="size-3 text-[#0d131b]"
          />
        </div>
      </div>
    </div>

    <button class="size-10 rounded-full bg-white border border-neutral-200 shadow-sm flex items-center justify-center relative">
      <UIcon
        name="i-lucide-bell"
        class="size-5 text-neutral-600"
      />
      <span class="absolute top-2 right-2 size-2 rounded-full bg-red-500 border border-white" />
    </button>
  </header>
</template>
